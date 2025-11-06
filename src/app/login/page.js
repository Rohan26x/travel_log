'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This sub-component will only render *after* a successful login.
// It's job is to immediately redirect the user to their dashboard.
const PostLoginRedirect = ({ user }) => {
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Render nothing, just handle the redirect logic
  return null;
};

export default function LoginPage() {
  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <Authenticator>
        {/* The Authenticator component shows the login form.
          When login is successful, it re-renders and passes the 'user' object
          to its child. Our child component is the redirect handler.
        */}
        {({ user }) => <PostLoginRedirect user={user} />}
      </Authenticator>
    </div>
  );
}