'use client';

import { useState, useEffect } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { generateClient } from 'aws-amplify/api';
import { getUrl } from 'aws-amplify/storage';
import { getTravelLog, listProfiles } from '@/graphql/queries'; 

const client = generateClient();

// --- STYLES OBJECT (with modifications) ---
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
  },
  // Styles for the log content
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    maxWidth: '900px',
    margin: '0 auto',
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '20px',
  },
  profileTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  editProfileButton: {
    padding: '10px 20px',
    backgroundColor: '#f39c12',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
  },
  profileDetails: {
    display: 'grid',
    gridTemplateColumns: '200px 1fr', // Label column and Value column
    gap: '20px',
  },
  detailLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '16px',
    color: '#333',
    whiteSpace: 'pre-wrap', 
  },
  // --- MODIFIED: Images are larger ---
  imageGallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px',
    marginTop: '30px', // Added top margin
    borderTop: '1px solid #e0e0e0', // Separator line
    paddingTop: '30px', // Space above images
  },
  imageItem: {
    position: 'relative',
    width: '100%',
    paddingTop: '75%', 
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px',
  },
};

function ViewLogPage({ signOut, user }) {
  const router = useRouter();
  const params = useParams(); 
  
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState(null);
  const [profile, setProfile] = useState(null);
  const [signedImageUrls, setSignedImageUrls] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const { id } = params;
      if (!id || !user) return;

      try {
        // 1. Fetch the Profile (for the header)
        const profileData = await client.graphql({
          query: listProfiles,
          variables: { filter: { owner: { eq: user.username } } },
          consistencyLevel: 'STRONG'
        });
        const profiles = profileData.data.listProfiles.items;
        if (profiles.length === 0) {
          router.push('/create-profile'); 
          return;
        }
        setProfile(profiles[0]);

        // 2. Fetch the specific Travel Log
        const logData = await client.graphql({
          query: getTravelLog,
          variables: { id: id }
        });
        const fetchedLog = logData.data.getTravelLog;

        if (!fetchedLog) {
          setError("Log not found or you don't have permission to view it.");
          setLoading(false);
          return;
        }
        setLog(fetchedLog);

        // 3. Fetch Signed URLs for the log's images
        if (fetchedLog.imageUrls && fetchedLog.imageUrls.length > 0) {
          const urls = await Promise.all(
            fetchedLog.imageUrls.map(async (imageUrl) => {
              const fileKey = imageUrl.split('.com/')[1];
              const result = await getUrl({
                key: fileKey,
                options: { validateObjectExistence: true },
              });
              return result.url.href;
            })
          );
          setSignedImageUrls(urls);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError("Failed to load log.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params, user, router]);

  // --- Render logic ---

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.sidebar}>
           <h2 style={styles.sidebarTitle}>Traveler Portal</h2>
        </div>
        <div style={{...styles.mainContent, ...styles.content, alignItems: 'center', paddingTop: '100px'}}>
          <p>Loading your adventure...</p>
        </div>
      </div>
    );
  }

  // Use the same sidebar/header as the dashboard
  return (
    <div style={styles.wrapper}>
      {/* Sidebar - Mark "Dashboard" as active */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Traveler Portal</h2>
        <Link href="/dashboard" style={{ ...styles.navItem, ...styles.navItemActive }}>
          <span style={styles.navIcon}>📊</span>
          <span>Dashboard</span>
        </Link>
        <Link href="/create-log" style={styles.navItem}>
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
            <span style={styles.userEmail}>
              Welcome, {profile ? profile.username : '...'}!
            </span>
            <button onClick={signOut} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>

        {/* --- MODIFIED: Log View Content Area --- */}
        <div style={styles.content}>
          <div style={styles.profileCard}>
            
            {error && <p style={{color: 'red'}}>{error}</p>}
            
            {log && (
              <>
                <div style={styles.profileHeader}>
                  <h2 style={styles.profileTitle}>{log.location}</h2>
                  <Link href={`/edit-log/${log.id}`} style={styles.editProfileButton}>
                    Edit This Log
                  </Link>
                </div>
                
                {/* --- MODIFIED: Details are now first --- */}
                <div style={styles.profileDetails}>
                  <span style={styles.detailLabel}>What You Did</span>
                  <span style={styles.detailValue}>{log.whatYouDidThere || 'N/A'}</span>

                  <span style={styles.detailLabel}>Overall Experience</span>
                  <span style={styles.detailValue}>{log.overallExperience || 'N/A'}</span>

                  <span style={styles.detailLabel}>Place Type</span>
                  <span style={styles.detailValue}>{log.place || 'N/A'}</span>
                  
                  <span style={styles.detailLabel}>Region Speciality</span>
                  <span style={styles.detailValue}>{log.regionSpeciality || 'N/A'}</span>

                  <span style={styles.detailLabel}>Fun Level</span>
                  <span style={styles.detailValue}>{'🤩'.repeat(log.funLevel) || 'N/A'}</span>
                  
                  <span style={styles.detailLabel}>Weather</span>
                  <span style={styles.detailValue}>{log.weather || 'N/A'}</span>
                </div>

                {/* --- MODIFIED: Gallery is now second --- */}
                {signedImageUrls.length > 0 && (
                  <div style={styles.imageGallery}>
                    {signedImageUrls.map((url, index) => (
                      <div key={index} style={styles.imageItem}>
                        <img 
                          src={url} 
                          alt={`Log photo ${index + 1}`}
                          style={styles.image}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(ViewLogPage);