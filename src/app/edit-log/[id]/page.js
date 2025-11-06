'use client';

// React & Next.js imports
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Amplify imports
import { withAuthenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { uploadData, remove } from 'aws-amplify/storage';
import { fetchAuthSession } from 'aws-amplify/auth';

// Our reusable form component!
import TravelLogForm from '../../components/TravelLogForm';

// GraphQL queries & mutations
import { getTravelLog } from '@/graphql/queries';
import { updateTravelLog } from '@/graphql/mutations'; // This is a new one!

const client = generateClient();

function EditLogPage({ user }) {
  // State for the page
  const [log, setLog] = useState(null); // This is the initial, pre-filled data
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const params = useParams(); // Gets the { id: "..." } from the URL
  const router = useRouter(); // To redirect on success

  // 1. FETCH THE LOG DATA ON PAGE LOAD
  useEffect(() => {
    async function fetchLogDetails() {
      const { id } = params;
      if (!id) return;

      try {
        const response = await client.graphql({
          query: getTravelLog,
          variables: { id: id }
        });

        const fetchedLog = response.data.getTravelLog;
        if (fetchedLog) {
          setLog(fetchedLog); // Save the log data in state
        } else {
          setError("Log not found or you don't have permission to edit it.");
        }
      } catch (err) {
        console.error('Error fetching log:', err);
        setError("Failed to load log details.");
      } finally {
        setLoading(false);
      }
    }

    fetchLogDetails();
  }, [params]);

  // 2. DEFINE THE "UPDATE" LOGIC
  // This is the function we'll pass to our form component
  const handleUpdateLog = async (formData, newImageFiles, existingImageUrls) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { identityId } = (await fetchAuthSession()).credentials;
      const s3Bucket = Amplify.getConfig().Storage.S3.bucket;

      // 2a. Delete images that were removed by the user
      // We check the original log's images against the new list
      const imagesToDelete = log.imageUrls.filter(
        (url) => !existingImageUrls.includes(url)
      );

      for (const imageUrl of imagesToDelete) {
        // Need to parse the S3 key from the full URL
        const fileKey = imageUrl.split('.com/')[1];
        await remove({ key: fileKey }).result; // <-- Fixed!
      }

      // 2b. Upload NEW images
      const newUploadedUrls = [];
      for (const file of newImageFiles) {
        const fileKey = `private/${identityId}/${Date.now()}-${file.name}`;
        await uploadData({ key: fileKey, data: file }).result;
        const s3Url = `https://${s3Bucket}.s3.amazonaws.com/${fileKey}`;
        newUploadedUrls.push(s3Url);
      }

      // 2c. Prepare final data for the database
      const { location, whatYouDidThere, overallExperience, place, regionSpeciality, funLevel, weather } = formData;
      const updatedLogDetails = {
        id: log.id, // <-- CRITICAL: Pass the ID for the update!
        location,
        whatYouDidThere,
        overallExperience,
        // Combine old (but kept) images with brand new ones
        imageUrls: [...existingImageUrls, ...newUploadedUrls],
        place: place || null,
        regionSpeciality: regionSpeciality || null,
        funLevel: parseInt(funLevel, 10),
        weather: weather.join(', '),
      };

      // 2d. Call the 'updateTravelLog' mutation
      await client.graphql({
        query: updateTravelLog,
        variables: { input: updatedLogDetails },
      });

      // 3. Success! Redirect to the dashboard
      alert('Log updated successfully!');
      router.push('/dashboard');

    } catch (err) {
      console.error("Error updating travel log:", err);
      setError("Failed to update log. Please try again.");
      setIsSubmitting(false);
    }
  };

  // --- 3. RENDER THE PAGE ---

  if (loading) {
    return <p style={{ padding: '20px' }}>Loading log details...</p>;
  }

  if (error) {
    return <p style={{ padding: '20px', color: '#e74c3c' }}>Error: {error}</p>;
  }

  if (!log) {
    return <p style={{ padding: '20px' }}>Log not found.</p>;
  }

  // If we have the log, render the form!
  return (
    <div>
      <h1 style={{ textAlign: 'center', color: '#61dafb', margin: '30px 0' }}>
        Editing: {log.location}
      </h1>

      {error && <p style={{ color: '#e74c3c', textAlign: 'center', marginBottom: '20px' }}>Error: {error}</p>}

      {/* This is the magic. We render the SAME form, but pre-fill it
          and give it our 'update' function instead of our 'create' function.
       */}
      <TravelLogForm
        initialData={log}
        handleSubmit={handleUpdateLog}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

// Don't forget to wrap the page!
export default withAuthenticator(EditLogPage);