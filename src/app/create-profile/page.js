'use client';

import { useState } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/api';
import { createProfile } from '@/graphql/mutations'; 
import './ProfileForm.css'; 
import Link from 'next/link'; // Import Link

const client = generateClient();

// The page gets 'user' as a prop from withAuthenticator
function CreateProfilePage({ user }) { 
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    birthdate: '',
    gender: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State to show the success screen
  const [isSuccess, setIsSuccess] = useState(false); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const profileDetails = {
        // --- THIS IS THE FIX ---
        // We are explicitly setting the 'owner' field.
        // user.username from withAuthenticator is the user's unique ID (sub).
        owner: user.username, 
        // --- END OF FIX ---

        username: formData.username,
        firstName: formData.firstName || null, 
        lastName: formData.lastName || null,
        birthdate: formData.birthdate || null,
        gender: formData.gender || null,
        bio: formData.bio || null,
      };

      await client.graphql({
        query: createProfile,
        variables: { input: profileDetails },
      });

      // Show success screen (this logic is fine)
      setLoading(false);
      setIsSuccess(true);
      
    } catch (err) {
      console.error('Error creating profile:', err);
      if (err.errors && err.errors[0].message.includes('ConditionalCheckFailed')) {
        setError('That username is already taken. Please choose another.');
      } else {
        setError('Failed to create profile. Please try again.');
      }
      setLoading(false);
    }
  };

  // --- Render logic ---
  // If 'isSuccess' is true, show the success message.
  if (isSuccess) {
    return (
      <main className="profile-form-container success-message">
        <h1>Profile Created!</h1>
        <p>Your profile is all set up. Let's get to the good part.</p>
        <Link href="/dashboard" className="success-button">
          Go to Dashboard
        </Link>
      </main>
    );
  }

  // Otherwise, show the form
  return (
    <main className="profile-form-container">
      <h1>Create Your Profile</h1>
      <p>Please complete your profile to continue.</p>

      <form onSubmit={handleSubmit}>
        {error && <p className="status-message error">{error}</p>}

        {/* (All your form fields are unchanged) */}
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
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </main>
  );
}

export default withAuthenticator(CreateProfilePage);