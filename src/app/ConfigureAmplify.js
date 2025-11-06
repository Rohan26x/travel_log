'use client'; // This is the MOST important line.

import { Amplify } from 'aws-amplify';
import config from '../amplifyconfiguration.json';
import '@aws-amplify/ui-react/styles.css';

// This line connects your app to the backend
Amplify.configure(config);

// This component will just render its children
// but it will run the configuration code above first.
export default function ConfigureAmplify({ children }) {
  return <>{children}</>;
}