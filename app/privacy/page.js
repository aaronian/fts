export const metadata = {
  title: 'Privacy Policy — Follow the Sun',
};

export default function PrivacyPage() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.h1}>Privacy Policy</h1>
        <p style={styles.meta}>Follow the Sun · Last updated March 2026</p>

        <h2 style={styles.h2}>What We Collect</h2>
        <ul style={styles.list}>
          <li><strong>Account information</strong> — your email address and name, collected via Clerk when you sign in.</li>
          <li><strong>Outdoor activity data</strong> — the time logs, durations, and activity categories you enter.</li>
          <li><strong>Location</strong> — used in the moment to fetch local weather and sunrise/sunset times. Your location is never stored or shared.</li>
        </ul>

        <h2 style={styles.h2}>How We Use It</h2>
        <p style={styles.p}>
          Your data is used solely to provide the app's features: syncing your logs across devices,
          showing your stats, and personalizing your experience. We do not sell your data or use it
          for advertising.
        </p>

        <h2 style={styles.h2}>Third Parties</h2>
        <ul style={styles.list}>
          <li><strong>Clerk</strong> — handles authentication. See <a href="https://clerk.com/privacy" style={styles.link}>clerk.com/privacy</a>.</li>
          <li><strong>Open-Meteo</strong> — provides weather data. No personal data is sent. See <a href="https://open-meteo.com" style={styles.link}>open-meteo.com</a>.</li>
        </ul>

        <h2 style={styles.h2}>Data Retention</h2>
        <p style={styles.p}>
          Your activity logs are stored as long as your account is active. You can request deletion
          of your data at any time by contacting us.
        </p>

        <h2 style={styles.h2}>Contact</h2>
        <p style={styles.p}>
          <a href="mailto:questions@followsun.app" style={styles.link}>questions@followsun.app</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f3ed',
    padding: '40px 20px',
  },
  content: {
    maxWidth: 680,
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: '40px 48px',
    boxShadow: '0 2px 12px rgba(90, 122, 77, 0.08)',
  },
  h1: {
    fontSize: 32,
    fontWeight: 700,
    color: '#5a7a4d',
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: '#7a8c6f',
    marginBottom: 32,
  },
  h2: {
    fontSize: 18,
    fontWeight: 600,
    color: '#5a7a4d',
    marginTop: 32,
    marginBottom: 12,
  },
  p: {
    fontSize: 15,
    color: '#4a5a40',
    lineHeight: 1.7,
    margin: 0,
  },
  list: {
    fontSize: 15,
    color: '#4a5a40',
    lineHeight: 1.9,
    paddingLeft: 20,
  },
  link: {
    color: '#6b8e5a',
  },
};
