'use client';

import { useState, useEffect } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/api';
import Link from 'next/link';

// Import the queries and mutations we need
import { listProfiles } from '@/graphql/queries';
import { updateProfile } from '@/graphql/mutations'; 

// We can reuse the *exact same* CSS file from create-profile
import '../create-profile/ProfileForm.css'; 

const client = generateClient();

// --- We are copying the styles object from your dashboard/profile pages ---
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
  navItemActive: { // This is the 'active' style
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
    // This is the white area where the form will live
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

function EditProfilePage({ signOut, user }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    birthdate: '',
    gender: '',
    bio: '',
  });
  
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // We'll store the username in a separate state
  // to display it in the header
  const [username, setUsername] = useState('...'); 

  // --- Fetch existing profile data on page load ---
  useEffect(() => {
    async function fetchProfile() {
      try {
        const profileData = await client.graphql({
          query: listProfiles,
          variables: {
            filter: { owner: { eq: user.username } }
          },
          consistencyLevel: 'STRONG'
        });
        
        const profile = profileData.data.listProfiles.items[0];

        if (profile) {
          // Pre-fill the form
          setFormData({
            username: profile.username || '',
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            birthdate: profile.birthdate || '',
            gender: profile.gender || '',
            bio: profile.bio || '',
          });
          setProfileId(profile.id);
          setUsername(profile.username); // Save username for header
        } else {
          setError("Could not find your profile to edit.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Error loading your data.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- This now calls 'updateProfile' ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const profileDetails = {
        id: profileId, // Tell it *which* profile to update
        username: formData.username,
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        birthdate: formData.birthdate || null,
        gender: formData.gender || null,
        bio: formData.bio || null,
      };

      await client.graphql({
        query: updateProfile, // Use the 'update' mutation
        variables: { input: profileDetails },
      });

      // Success! Redirect back to the profile page.
      router.push('/profile');

    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.errors && err.errors[0].message.includes('ConditionalCheckFailed')) {
        setError('That username is already taken. Please choose another.');
      } else {
        setError('Failed to update profile. Please try again.');
      }
      setLoading(false);
    }
  };

  // --- Main Page Render ---
  return (
    <div style={styles.wrapper}>
      {/* Sidebar - Copied from dashboard, 'Profile' is active */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Traveler Portal</h2>
        <Link href="/dashboard" style={styles.navItem}>
          <span style={styles.navIcon}>📊</span>
          <span>Dashboard</span>
        </Link>
        <Link href="/create-log" style={styles.navItem}>
          <span style={styles.navIcon}>➕</span>
          <span>Post New Log</span>
        </Link>
        <Link href="/profile" style={{ ...styles.navItem, ...styles.navItemActive }}>
          <span style={styles.navIcon}>👤</span>
          <span>Profile</span>
        </Link>
        <div style={styles.notificationIcon}>N</div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header - Copied from dashboard */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Travel Portal</h1>
          <div style={styles.headerRight}>
            <span style={styles.userEmail}>
              Welcome, {loading ? '...' : username}!
            </span>
            <button onClick={signOut} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>

        {/* --- MODIFIED: Content Area --- */}
        {/* This now holds your form, which is styled by ProfileForm.css */}
        <div style={styles.content}>
          
          {/* We use the 'profile-form-container' class to apply the dark theme */}
          <main className="profile-form-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{marginBottom: 0}}>Edit Your Profile</h1>
              <Link href="/profile" style={{color: '#9cdcfe', textDecoration: 'none', fontSize: '14px'}}>
                &larr; Cancel and go back
              </Link>
            </div>
            <p style={{textAlign: 'left', color: '#aaa', fontSize: '1em'}}>Update your personal details here.</p>

            {/* Show loading spinner while fetching data */}
            {loading && !profileId && (
              <p>Loading your profile for editing...</p>
            )}

            {/* Show the form ONLY if we are NOT loading */}
            {!loading && (
              <form onSubmit={handleSubmit}>
                {error && <p className="status-message error">{error}</p>}

                <div className="form-group">
                  <label htmlFor="username">Username (public):</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g., TravelLover99"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="firstName">First Name:</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name:</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="birthdate">Birthdate:</label>
                  <input
                    type="date"
                    id="birthdate"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Gender:</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Your Bio:</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about your travel style!"
                  />
                </div>

                <button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}
          </main>
          
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(EditProfilePage);