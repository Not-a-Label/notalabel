export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Not a Label - Frontend</h1>
      <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
    </div>
  );
} 