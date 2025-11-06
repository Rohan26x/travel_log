'use client';

import { useState, useEffect } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/api';
import { Amplify } from 'aws-amplify';
import { uploadData } from 'aws-amplify/storage';
import { fetchAuthSession } from 'aws-amplify/auth';
import Link from 'next/link';

// --- THIS IS THE FIX ---
// createTravelLog comes from mutations
import { createTravelLog } from '@/graphql/mutations'; 
// listProfiles comes from queries
import { listProfiles } from '@/graphql/queries'; 
// --- END OF FIX ---

import TravelLogForm from '../components/TravelLogForm';
// Import the light-theme CSS from the profile page
import '../create-profile/ProfileForm.css'; 

const client = generateClient();

// (This is the same styles object from your dashboard)
const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#f0f0f0',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    left: 0,
    top: 0,
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #ddd',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    marginBottom: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#333',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  navItemActive: {
    backgroundColor: '#e3f2fd',
    borderLeft: '4px solid #2196f3',
    fontWeight: '500',
    color: '#2196f3',
  },
  navIcon: {
    fontSize: '18px',
    width: '20px',
    textAlign: 'center',
  },
  mainContent: {
    marginLeft: '250px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#fff',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e0e0e0',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userEmail: {
    fontSize: '14px',
    color: '#666',
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  content: {
    padding: '40px',
    backgroundColor: '#fff',
    minHeight: 'calc(100vh - 80px)',
  },
  notificationIcon: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    width: '32px',
    height: '32px',
    backgroundColor: '#f44336',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
  }
};
// --- END OF STYLES ---


function CreateLogPage({ signOut, user }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('...'); // For header
  const router = useRouter();

  // Fetch username for the header
  useEffect(() => {
    async function fetchProfile() {
      try {
        const profileData = await client.graphql({
          query: listProfiles,
          variables: { filter: { owner: { eq: user.username } } },
          consistencyLevel: 'STRONG'
        });
        const profile = profileData.data.listProfiles.items[0];
        if (profile) {
          setUsername(profile.username);
        } else {
          router.push('/create-profile'); // Failsafe
        }
      } catch (e) { console.error("Error fetching username", e)}
    }
    fetchProfile();
  }, [user, router]);


  // This is the logic to handle the form submission
  const handleCreateLog = async (formData, newImageFiles, existingImageUrls) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { identityId } = (await fetchAuthSession()).credentials;
      const s3Bucket = Amplify.getConfig().Storage.S3.bucket;

      const uploadedImageUrls = [];
      for (const file of newImageFiles) {
        const fileKey = `private/${identityId}/${Date.now()}-${file.name}`;
        await uploadData({ key: fileKey, data: file }).result;
        const s3Url = `https://${s3Bucket}.s3.amazonaws.com/${fileKey}`;
        uploadedImageUrls.push(s3Url);
      }

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

      await client.graphql({
        query: createTravelLog,
        variables: { input: travelLogDetails },
      });

      router.push('/dashboard'); 

    } catch (err) {
      console.error("Error creating travel log:", err);
      setError("Failed to create travel log. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Sidebar - 'Post New Log' is active */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Traveler Portal</h2>
        <Link href="/dashboard" style={styles.navItem}>
          <span style={styles.navIcon}>📊</span>
          <span>Dashboard</span>
        </Link>
        <Link href="/create-log" style={{ ...styles.navItem, ...styles.navItemActive }}>
          <span style={styles.navIcon}>➕</span>
          <span>Post New Log</span>
        </Link>
        <Link href="/profile" style={styles.navItem}>
          <span style={styles.navIcon}>👤</span>
          <span>Profile</span>
        </Link>
        <div style={styles.notificationIcon}>N</div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Travel Portal</h1>
          <div style={styles.headerRight}>
            <span style={styles.userEmail}>Welcome, {username}!</span>
            <button onClick={signOut} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>

        {/* Content Area - This holds the form */}
        <div style={styles.content}>
          {/* We render the reusable form here.
            It will be styled by the '../create-profile/ProfileForm.css' import.
          */}
          <div className="log-form-container" style={{maxWidth: '1000px', margin: '0 auto', padding: '10px'}}>
             <h1 style={{color: '#333', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px'}}>
               Post a New Travel Log
             </h1>
          
            <TravelLogForm
              handleSubmit={handleCreateLog}
              isSubmitting={isSubmitting}
            />

            {error && (
              <p className="status-message error" style={{marginTop: '20px'}}>{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(CreateLogPage);