'use client';

import {
  Authenticator,
  Button,
  TextField,
  SelectField,
  useAuthenticator,
} from '@aws-amplify/ui-react';
import { signUp } from 'aws-amplify/auth'; 
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';


// --- 1. The FULLY CUSTOM SIGN UP FORM ---
// It now correctly uses the globally provided hook
const ManualSignUpForm = () => {
  const { toConfirmSignUp, setUsername, toSignIn } = useAuthenticator(); // <--- This now works!
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleManualSignUp = async (e) => {
    e.preventDefault();
    setError('');

    const { email, password, confirm_password, given_name, family_name, birthdate, gender, bio } = formData;

    if (password !== confirm_password) {
      return setError('Passwords do not match.');
    }

    try {
      await signUp({
        username: email, 
        password: password,
        options: {
          userAttributes: {
            email: email,
            given_name: given_name,
            family_name: family_name,
            birthdate: birthdate,
            gender: gender,
            'custom:bio': bio, 
          },
        },
      });

      // If sign-up is successful, move to the confirmation screen
      setUsername(email); 
      toConfirmSignUp();  

    } catch (err) {
      console.error('Manual Sign Up Error:', err);
      setError(err.message || 'An unknown sign up error occurred.');
    }
  };

  return (
    <div className="custom-auth-form">
      <h2 style={{ color: '#61dafb', textAlign: 'center', margin: '10px 0' }}>Create Profile</h2>

      <form onSubmit={handleManualSignUp}>
        {error && <p style={{ color: '#e74c3c', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

        <TextField label="Email Address" name="email" onChange={handleChange} required />
        <TextField label="Password" name="password" type="password" onChange={handleChange} required />
        <TextField label="Confirm Password" name="confirm_password" type="password" onChange={handleChange} required />

        <TextField label="First Name" name="given_name" onChange={handleChange} required />
        <TextField label="Last Name" name="family_name" onChange={handleChange} required />

        <TextField label="Date of Birth" name="birthdate" type="date" onChange={handleChange} required />
        <SelectField label="Gender" name="gender" onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
        </SelectField>

        <TextField label="Travel Bio" name="bio" onChange={handleChange} placeholder="Tell us about your travel style" />

        <Button type="submit" variation="primary" style={{ marginTop: '20px' }}>
          Create Account
        </Button>
      </form>
      <Button variation="link" onClick={toSignIn} style={{ marginTop: '10px' }}>
        Back to Sign In
      </Button>
    </div>
  );
};


// --- 2. Component to handle redirection after successful login/signup ---
const PostLoginRedirect = ({ user }) => {
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return null;
};

// --- 3. Main Login Page Component ---
export default function LoginPage() {

  // We define the components object here
  const components = {
    SignUp: {
      Form: ManualSignUpForm, // Just reference the component
    },
    ConfirmSignUp: {
      Header() {
        return (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <h2 style={{ color: '#61dafb' }}>Confirm Your Email</h2>
          </div>
        );
      },
    },
    // Standard Header for all forms
    Header() {
        return (
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <h2 style={{ color: '#61dafb' }}>Travel Log</h2>
            </div>
        );
    },
  };

  // We only render the Authenticator. The context is now provided by layout.js
  return (
    <div style={{ maxWidth: '450px', margin: '50px auto', padding: '20px' }}>
      <Authenticator
        components={components}
        initialState="signUp"
      >
        {/* The child component (PostLoginRedirect) now receives the user object */}
        {({ user }) => <PostLoginRedirect user={user} />}
      </Authenticator>
    </div>
  );
}

// --- Inject Global CSS (CSS injection must stay outside the component) ---
const globalAuthStyles = `
  [data-amplify-container] {
    background-color: #3a3f4b !important;
    border: 1px solid #555;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
    padding: 30px !important; 
  }

  [data-amplify-text-field] input,
  [data-amplify-password-field] input,
  [data-amplify-select-field] select {
      background-color: #282c34 !important;
      color: #e0e0e0 !important;
      border: 1px solid #555 !important;
  }

  [data-amplify-button][data-variation='primary'] {
    background-color: #61dafb !important;
    color: #282c34 !important;
    font-weight: bold;
    border: none;
    width: 100%;
  }

  [data-amplify-label],
  [data-amplify-link] {
    color: #e0e0e0 !important;
  }
  [data-amplify-link] {
    color: #61dafb !important;
  }
`;

if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = globalAuthStyles;
  document.head.appendChild(style);
}