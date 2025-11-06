'use client';

import { useState, useEffect } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/api';
import { listProfiles } from '@/graphql/queries'; 

const client = generateClient();

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
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    maxWidth: '800px',
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
    gridTemplateColumns: '1fr 2fr',
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
  }
};

function ProfilePage({ signOut, user }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function checkProfile() {
      try {
        const profileData = await client.graphql({
          query: listProfiles,
          variables: {
            filter: { owner: { eq: user.username } }
          },
          consistencyLevel: 'STRONG'
        });

        const profiles = profileData.data.listProfiles.items;

        if (profiles.length === 0) {
          router.push('/create-profile');
        } else {
          setProfile(profiles[0]);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      checkProfile();
    }
  }, [user, router]);

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

  if (!profile) {
    return (
       <div style={styles.wrapper}>
        <div style={styles.sidebar}>
           <h2 style={styles.sidebarTitle}>Traveler Portal</h2>
        </div>
        <div style={{...styles.mainContent, ...styles.content, alignItems: 'center', paddingTop: '100px'}}>
          <p>Could not load profile.</p>
        </div>
      </div>
    );
  }

  // --- Main Page Render ---
  return (
    <div style={styles.wrapper}>
      {/* Sidebar - 'Profile' is active */}
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
        {/* --- NEW LINK ADDED --- */}
        <Link href="/search" style={styles.navItem}>
          <span style={styles.navIcon}>🔍</span>
          <span>Search Places</span>
        </Link>
        <div style={styles.notificationIcon}>N</div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header - Shows the profile username */}
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

        {/* Profile Content Area */}
        <div style={styles.content}>
          <div style={styles.profileCard}>
            
            <div style={styles.profileHeader}>
              <h2 style={styles.profileTitle}>My Profile</h2>
              <Link href="/edit-profile" style={styles.editProfileButton}>
                Edit Profile
              </Link>
            </div>

            <div style={styles.profileDetails}>
              <span style={styles.detailLabel}>Username</span>
              <span style={styles.detailValue}>{profile.username}</span>

              <span style={styles.detailLabel}>Email</span>
              <span style={styles.detailValue}>{user.username}</span>

              <span style={styles.detailLabel}>First Name</span>
              <span style={styles.detailValue}>{profile.firstName || 'Not set'}</span>

              <span style={styles.detailLabel}>Last Name</span>
              <span style={styles.detailValue}>{profile.lastName || 'Not set'}</span>

              <span style={styles.detailLabel}>Birthdate</span>
              <span style={styles.detailValue}>{profile.birthdate || 'Not set'}</span>
              
              <span style={styles.detailLabel}>Gender</span>
              <span style={styles.detailValue}>{profile.gender || 'Not set'}</span>

              <span style={styles.detailLabel}>Bio</span>
              <span style={styles.detailValue}>{profile.bio || 'Not set'}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(ProfilePage);