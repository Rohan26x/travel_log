'use client';

import { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { uploadData } from 'aws-amplify/storage';
import { fetchAuthSession } from 'aws-amplify/auth';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation'; // Import the router

// Import your new REUSABLE form component
import TravelLogForm from '../components/TravelLogForm';

// Import the GraphQL mutation
import { createTravelLog } from '@/graphql/mutations';

// Initialize the API client
const client = generateClient();

function CreateLogPage({ user }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter(); // Get the router instance

  // This is the "Create" logic.
  // We pass this function *down* to the form component.
  const handleCreateLog = async (formData, newImageFiles) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Get Secure Identity ID (for S3)
      const { identityId } = (await fetchAuthSession()).credentials;
      const s3Bucket = Amplify.getConfig().Storage.S3.bucket;

      // 2. Upload NEW Images
      const uploadedImageUrls = [];
      for (const file of newImageFiles) {
        const fileKey = `private/${identityId}/${Date.now()}-${file.name}`;
        await uploadData({ key: fileKey, data: file }).result;
        const s3Url = `https://${s3Bucket}.s3.amazonaws.com/${fileKey}`;
        uploadedImageUrls.push(s3Url);
      }

      // 3. Prepare Data for Database
      const { location, whatYouDidThere, overallExperience, place, regionSpeciality, funLevel, weather } = formData;
      const travelLogDetails = {
        location,
        whatYouDidThere,
        overallExperience,
        imageUrls: uploadedImageUrls,
        place: place || null,
        regionSpeciality: regionSpeciality || null,
        funLevel: parseInt(funLevel, 10),
        weather: weather.join(', '),
      };

      // 4. Save to DynamoDB
      await client.graphql({
        query: createTravelLog,
        variables: { input: travelLogDetails },
      });

      // 5. Success! Redirect to the dashboard
      alert('Log created successfully!');
      router.push('/dashboard'); // Send user back to the dashboard

    } catch (err) {
      console.error("Error creating travel log:", err);
      setError("Failed to create travel log. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* We've moved the <h1> and error messages here */}
      <h1 style={{ textAlign: 'center', color: '#61dafb', margin: '30px 0' }}>
        Create a New Travel Log
      </h1>

      {error && <p style={{ color: '#e74c3c', textAlign: 'center', marginBottom: '20px' }}>Error: {error}</p>}

      {/* This is it. We just render the form and pass it:
        1. The function to run on submit
        2. The current submitting status
      */}
      <TravelLogForm
        handleSubmit={handleCreateLog}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default withAuthenticator(CreateLogPage);