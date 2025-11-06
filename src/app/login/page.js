'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Authenticator, 
  TextField, 
  SelectField,
  TextAreaField 
} from '@aws-amplify/ui-react';

// --- This is the new layout styling ---
const styles = {
  // This is the light-grey background, matching your dashboard wrapper
  wrapper: {
    display: 'flex',
    alignItems: 'flex-start', // Align card to the top
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5', // Dashboard's light grey background
    paddingTop: '60px', // Push the card down a bit
  },
  // This is the white card that holds the form
  contentCard: {
    backgroundColor: '#fff',
    padding: '40px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '480px', // A good width for a login form
  }
};
// --- End of new styles ---


// This sub-component redirects after login
const PostLoginRedirect = ({ user }) => {
  const router = useRouter();
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  return null;
};

// This is your custom sign-up form
const customComponents = {
  SignUp: {
    FormFields() {
      return (
        <>
          <Authenticator.SignUp.FormFields />
          <TextField
            name="given_name"
            label="First Name:"
            placeholder="Enter your first name"
            required
          />
          <TextField
            name="family_name"
            label="Last Name:"
            placeholder="Enter your last name"
            required
          />
          <TextField
            name="birthdate"
            label="Birthdate:"
            type="date"
            required
          />
          <SelectField
            name="gender"
            label="Gender:"
            required
          >
            <option value="" disabled>Select your gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </SelectField>
          <TextAreaField
            name="custom:bio"
            label="Your Bio:"
            placeholder="Tell us a little about your travel style"
          />
        </>
      );
    },
  },
};

// This is the new page render
export default function LoginPage() {
  return (
    // We apply the light-grey wrapper style here
    <div style={styles.wrapper}>
      {/* And this is the white content card */}
      <div style={styles.contentCard}>
        <Authenticator components={customComponents}>
          {({ user }) => <PostLoginRedirect user={user} />}
        </Authenticator>
      </div>
    </div>
  );
}