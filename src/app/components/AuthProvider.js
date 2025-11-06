'use client';

import React from 'react';
import { Amplify } from 'aws-amplify';
import config from '@/amplifyconfiguration.json'; // The main config file
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';

// Configure Amplify with your backend settings
Amplify.configure(config);

// This component provides the required context for useAuthenticator
// It must wrap all pages that use Amplify auth components or hooks.
export default function AuthProvider({ children }) {
  // The Authenticator.Provider is the "socket" the hooks need.
  return <Authenticator.Provider>{children}</Authenticator.Provider>;
}