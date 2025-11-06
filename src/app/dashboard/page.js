'use client';

import { useState, useEffect } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { generateClient } from 'aws-amplify/api';
import { getUrl } from 'aws-amplify/storage';
import { listTravelLogs, listProfiles } from '@/graphql/queries'; 
import { deleteTravelLog } from '@/graphql/mutations';

const client = generateClient();

// --- FULL STYLES OBJECT ---
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
    zIndex: 100, // Keep sidebar on top
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
  dashboardTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '30px',
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  jobTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  jobLocation: {
    fontSize: '14px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  locationIcon: {
    color: '#f44336',
    fontSize: '16px',
  },
  jobDescription: {
    fontSize: '14px',
    color: '#666',
    marginTop: '8px',
  },
  viewDetailsButton: {
    padding: '10px 20px',
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '12px',
    alignSelf: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  editButton: {
    padding: '10px 20px',
    backgroundColor: '#f39c12',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center',
  },
  deleteButton: {
    padding: '10px 20px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  viewButton: {
    padding: '10px 20px',
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center',
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
  imageGallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px',
    marginTop: '16px',
    marginBottom: '8px',
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
  floatingActionButton: {
    position: 'fixed',
    width: '60px',
    height: '60px',
    bottom: '40px',
    right: '40px',
    backgroundColor: '#2196f3',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    fontWeight: 'bold',
    textDecoration: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1001, 
    transition: 'transform 0.2s ease-in-out, background-color 0.2s',
  },
  floatingActionButtonHover: {
     transform: 'scale(1.1)',
     backgroundColor: '#1a78c2',
  }
};
// --- END OF FULL STYLES OBJECT ---

function Dashboard({ signOut, user }) {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null); 
  const [isFabHovered, setIsFabHovered] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch profile
        const profileData = await client.graphql({
          query: listProfiles,
          variables: { filter: { owner: { eq: user.username } } },
          consistencyLevel: 'STRONG'
        });
        const profiles = profileData.data.listProfiles.items;
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }
        
        // Fetch logs
        const response = await client.graphql({ query: listTravelLogs });
        let sortedLogs = response.data.listTravelLogs.items.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        const logsWithSignedImages = sortedLogs.map(async (log) => {
          if (log.imageUrls && log.imageUrls.length > 0) {
            const signedUrlsPromises = log.imageUrls.map(async (imageUrl) => {
              const fileKey = imageUrl.split('.com/')[1];
              const signedUrlResult = await getUrl({
                key: fileKey,
                options: { validateObjectExistence: true },
              });
              return signedUrlResult.url.href;
            });
            const signedUrls = await Promise.all(signedUrlsPromises);
            return { ...log, signedImageUrls: signedUrls };
          } else {
            return log;
          }
        });

        const finalLogs = await Promise.all(logsWithSignedImages);
        setLogs(finalLogs);

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false); 
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]); 

  async function handleDeleteLog(logId) {
    if (!window.confirm("Are you sure you want to delete this log forever?")) {
      return;
    }
    try {
      await client.graphql({
        query: deleteTravelLog,
        variables: { input: { id: logId } },
      });
      setLogs(logs.filter(log => log.id !== logId));
    } catch (err) {
      console.error('Error deleting travel log:', err);
      alert('Failed to delete log. Please try again.');
    }
  }

  // Show a loading screen while we check for the profile
  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.sidebar}>
           <h2 style={styles.sidebarTitle}>Traveler Portal</h2>
        </div>
        <div style={{...styles.mainContent, ...styles.content, alignItems: 'center', paddingTop: '100px'}}>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If not loading, and profile *exists*, render the dashboard.
  const totalLogs = logs.length;
  
  return (
    profile && (
      <div style={styles.wrapper}>
        {/* Sidebar */}
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
          {/* --- NEW LINK ADDED --- */}
          <Link href="/search" style={styles.navItem}>
            <span style={styles.navIcon}>🔍</span>
            <span>Search Places</span>
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
                Welcome, {profile.username}!
              </span>
              <button onClick={signOut} style={styles.logoutButton}>
                Logout
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={styles.content}>
            <h2 style={styles.dashboardTitle}>
              Traveler Dashboard
              <span style={{ fontSize: '18px', fontWeight: 'normal', color: '#666', marginLeft: '12px' }}>
                ({totalLogs} {totalLogs === 1 ? 'log' : 'logs'})
              </span>
            </h2>

            {/* Log Cards */}
            {!logs.length && (
              <div style={{ ...styles.jobCard, marginTop: '40px' }}>
                <p>You haven't created any logs yet. Time for an adventure?</p>
                <Link href="/create-log" style={styles.viewDetailsButton}>
                  Create Your First Log
                </Link>
              </div>
            )}

            {logs.length > 0 && (
              <div style={{ marginTop: '40px' }}>
                {logs.map((log) => (
                  <div key={log.id} style={styles.jobCard}>
                    <h3 style={styles.jobTitle}>{log.location || 'Untitled Location'}</h3>
                    <div style={styles.jobLocation}>
                      <span style={styles.locationIcon}>📍</span>
                      <span>{log.location || 'Unknown Location'}</span>
                    </div>
                    <p style={styles.jobDescription}>
                      {log.whatYouDidThere 
                        ? (log.whatYouDidThere.length > 50 
                            ? log.whatYouDidThere.substring(0, 50) + '...' 
                            : log.whatYouDidThere)
                        : 'No description available'}
                    </p>
                    
                    {log.signedImageUrls && log.signedImageUrls.length > 0 && (
                      <div style={styles.imageGallery}>
                        {log.signedImageUrls.map((url, index) => (
                          <div 
                            key={index} 
                            style={styles.imageItem}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <img 
                              src={url} 
                              alt={`${log.location} - Image ${index + 1}`}
                              style={styles.image}
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div style={styles.buttonContainer}>
                      <Link 
                        href={`/edit-log/${log.id}`} 
                        style={styles.editButton}
                      >
                        Edit Log
                      </Link>
                      <Link 
                        href={`/view-log/${log.id}`} 
                        style={styles.viewButton}
                      >
                        View
                      </Link>
                      <button 
                        onClick={() => handleDeleteLog(log.id)} 
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <Link 
          href="/create-log"
          style={{
            ...styles.floatingActionButton,
            ...(isFabHovered ? styles.floatingActionButtonHover : null)
          }}
          onMouseEnter={() => setIsFabHovered(true)}
          onMouseLeave={() => setIsFabHovered(false)}
          title="Create a new log"
        >
          +
        </Link>
      </div>
    )
  );
}

export default withAuthenticator(Dashboard);