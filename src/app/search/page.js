'use client';

import { useState, useEffect } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/api';
import { get } from 'aws-amplify/api'; // Import the 'get' helper for REST APIs
import { listProfiles } from '@/graphql/queries'; 

const client = generateClient();

// --- We are copying the styles object from your dashboard ---
const styles = {
  // (All styles are unchanged)
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
  searchContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  searchHeader: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '30px',
  },
  searchBar: {
    display: 'flex',
    gap: '10px',
  },
  searchInput: {
    flex: 1,
    padding: '14px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    backgroundColor: '#f9f9f9',
  },
  searchButton: {
    padding: '0 25px',
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
  },
  nearMeButton: {
    padding: '14px 25px',
    backgroundColor: '#f39c12', 
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
  },
  separator: {
    textAlign: 'center',
    color: '#999',
    margin: '20px 0',
  },
  resultsContainer: {
    marginTop: '40px',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    marginBottom: '15px',
  },
  resultName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2196f3',
    margin: 0,
  },
  resultAddress: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px',
  }
};
// --- END OF STYLES ---


function SearchPage({ signOut, user }) {
  const [loading, setLoading] = useState(true); // Page load
  const [profile, setProfile] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false); // For text search
  const [isFinding, setIsFinding] = useState(false); // For location search
  const [error, setError] = useState(null);

  // Fetch the user's profile for the header
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const profileData = await client.graphql({
          query: listProfiles,
          variables: { filter: { owner: { eq: user.username } } },
          consistencyLevel: 'STRONG'
        });
        const profiles = profileData.data.listProfiles.items;
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        } else {
          router.push('/create-profile'); // Failsafe
        }
      } catch (e) { console.error("Error fetching username", e)
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);
  
  // Text search handler (unchanged)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim() === '') return;

    setIsSearching(true);
    setError(null);
    setResults([]);

    try {
      const restOperation = get({
        apiName: 'locationSearchAPI',
        path: '/search',
        options: {
          queryParams: { query: searchTerm }
        }
      });
      const { body } = await restOperation.response;
      const data = await body.json();
      if (data.places) setResults(data.places);
    } catch (err) {
      console.error('Error searching location:', err);
      setError('Failed to fetch search results. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  // "Find Near Me" Handler
  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsFinding(true);
    setError(null);
    setResults([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // On Success
        const { latitude, longitude } = position.coords;
        try {
          // Call our API with the new lat/lon params
          const restOperation = get({
            apiName: 'locationSearchAPI',
            path: '/search',
            options: {
              queryParams: {
                lat: latitude,
                lon: longitude
              }
            }
          });
          const { body } = await restOperation.response;
          const data = await body.json();
          if (data.places) setResults(data.places);

        } catch (err) {
          console.error('Error finding near me:', err);
          setError('Failed to find places near you.');
        } finally {
          setIsFinding(false);
        }
      },
      (err) => {
        // On Error
        console.error("Geolocation error:", err);
        setError("Unable to get your location. Please check browser permissions.");
        setIsFinding(false);
      },
      { // Options
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  
  // Page is loading user profile
  if (loading) {
    return (
       <div style={styles.wrapper}>
        <div style={styles.sidebar}>
           <h2 style={styles.sidebarTitle}>Traveler Portal</h2>
        </div>
        <div style={{...styles.mainContent, ...styles.content, alignItems: 'center', paddingTop: '100px'}}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // --- Main Page Render ---
  return (
    <div style={styles.wrapper}>
      {/* Sidebar - Mark "Search" as active */}
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
        <Link href="/profile" style={styles.navItem}>
          <span style={styles.navIcon}>👤</span>
          <span>Profile</span>
        </Link>
        <Link href="/search" style={{ ...styles.navItem, ...styles.navItemActive }}>
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
              Welcome, {profile ? profile.username : '...'}!
            </span>
            <button onClick={signOut} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>

        {/* Search Content Area */}
        <div style={styles.content}>
          <div style={styles.searchContainer}>
            <h2 style={styles.searchHeader}>Find Famous Places</h2>
            
            <button
              style={{...styles.nearMeButton, width: '100%'}}
              onClick={handleFindNearMe}
              disabled={isFinding || isSearching}
            >
              {isFinding ? 'Finding your location...' : '📍 Find Famous Places Near Me'}
            </button>
            
            <div style={styles.separator}>— OR —</div>

            <form style={styles.searchBar} onSubmit={handleSearch}>
              <input
                type="text"
                style={styles.searchInput}
                placeholder="Search by city or landmark (e.g., 'Paris')"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit" 
                style={styles.searchButton} 
                disabled={isFinding || isSearching}
              >
                {isSearching ? '...' : 'Search'}
              </button>
            </form>

            <div style={styles.resultsContainer}>
              {error && <p style={{color: 'red'}}>{error}</p>}
              
              {(isSearching || isFinding) && <p>Searching...</p>}

              {!isSearching && !isFinding && results.length === 0 && (
                <p>No results. Try a new search.</p>
              )}

              {!isSearching && !isFinding && results.length > 0 && (
                <div>
                  {/* --- THIS IS THE FIX ---
                    We now use both the placeId and index to create a 
                    guaranteed unique key for React.
                  --- END OF FIX --- */}
                  {results.map((place, index) => (
                    <div key={`${place.placeId}-${index}`} style={styles.resultCard}>
                      <h3 style={styles.resultName}>{place.name}</h3>
                      <p style={styles.resultAddress}>{place.address}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(SearchPage);