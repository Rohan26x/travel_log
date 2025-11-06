import Link from 'next/link';
import './Landing.css'; // We will create this file next

export default function PublicLandingPage() {
  return (
    <main className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">
          Your Adventure, Your Story.
        </h1>
        <p className="landing-description">
          Stop letting those memories fade. Log your travels, save your photos,
          and remember every detail.
        </p>
        <div className="landing-buttons">
          <Link href="/dashboard" className="landing-btn primary">
            Get Started
          </Link>
          <Link href="/login" className="landing-btn secondary">
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}