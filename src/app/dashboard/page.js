'use client';

import { useState, useEffect } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import Link from 'next/link';
import { generateClient } from 'aws-amplify/api';

// --- FIXED: Import 'getUrl' instead of 'get' ---
import { getUrl } from 'aws-amplify/storage';

import { listTravelLogs } from '@/graphql/queries';
import { deleteTravelLog } from '@/graphql/mutations';

const client = generateClient();

// (All the styles are the same, no changes here)
const styles = {
  container: { padding: '20px', maxWidth: '900px', margin: '0 auto' },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '30px'
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#61dafb',
    color: '#282c34',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
  },
  signOutButton: {
    padding: '10px 15px',
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  logHistoryContainer: {
    marginTop: '40px',
  },
  logBanner: {
    backgroundColor: '#3a3f4b',
    border: '1px solid #555',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  logLocation: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#61dafb',
  },
  logDescription: {
    fontSize: '1.1rem',
    color: '#e0e0e0',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: '50px',
  },
  editButton: {
    padding: '8px 12px',
    backgroundColor: '#f39c12',
    color: '#282c34',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center',
  },
  deleteButton: {
    padding: '8px 12px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  imageGallery: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    overflowX: 'auto',
  },
  logImage: {
    width: '150px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid #555',
  }
};

function Dashboard({ signOut, user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      // 1. Fetch the log data
      const response = await client.graphql({
        query: listTravelLogs
      });
      
      let sortedLogs = response.data.listTravelLogs.items.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // 2. Get signed URLs for the images
      const logsWithSignedImages = sortedLogs.map(async (log) => {
        if (log.imageUrls && log.imageUrls.length > 0) {
          
          const signedUrlsPromises = log.imageUrls.map(async (imageUrl) => {
            const fileKey = imageUrl.split('.com/')[1];
            
            // --- FIXED: Call 'getUrl' instead of 'get' ---
            const signedUrlResult = await getUrl({
              key: fileKey,
              options: {
                validateObjectExistence: true,
              },
            });
            
            return signedUrlResult.url.href; // Get the URL string
          });
          
          const signedUrls = await Promise.all(signedUrlsPromises);
          return { ...log, signedImageUrls: signedUrls };
        } else {
          return log;
        }
      });

      // 3. Wait for all logs and all their images to be processed
      const finalLogs = await Promise.all(logsWithSignedImages);

      setLogs(finalLogs);

    } catch (err) {
      console.error('Error fetching travel logs:', err);
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <main style={styles.container}>
      <nav style={styles.nav}>
        <h1>Hello, {user.username}</h1>
        <button onClick={signOut} style={styles.signOutButton}>
          Sign Out
        </button>
      </nav>

      <Link href="/create-log" style={styles.button}>
        + Create New Log
      </Link>

      <section style={styles.logHistoryContainer}>
        <h2>Log History</h2>

        {loading && <p>Loading your adventures...</p>}
        {!loading && logs.length === 0 && (
          <p>You haven't created any logs yet. Time for an adventure?</p>
        )}

        {!loading && logs.length > 0 && (
          <div>
            {logs.map((log) => (
              <div key={log.id} style={styles.logBanner}>
                
                {/* 1. Content (Log info + images) */}
                <div style={{ flexGrow: 1 }}>
                  <div style={styles.logHeader}>
                    <h3 style={styles.logLocation}>{log.location}</h3>
                  </div>

                  <p style={styles.logDescription}>{log.whatYouDidThere}</p>

                  {/* Image Gallery */}
                  {log.signedImageUrls && log.signedImageUrls.length > 0 && (
                    <div style={styles.imageGallery}>
                      {log.signedImageUrls.map((url, index) => (
                        <img 
                          key={index} 
                          src={url} 
                          alt={`Log photo ${index + 1}`} 
                          style={styles.logImage} 
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Buttons (Edit/Delete) */}
                <div style={styles.buttonContainer}>
                  <Link 
                    href={`/edit-log/${log.id}`} 
                    style={styles.editButton}
                  >
                    Edit
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
      </section>
    </main>
  );
}

export default withAuthenticator(Dashboard);