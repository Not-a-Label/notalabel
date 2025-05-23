import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the client component with no SSR
const AuthTest = dynamic(() => import('./auth-test'), { ssr: false });

export default function SupabaseTestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Integration Test</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-xl font-semibold mb-3">Authentication Test</h2>
          <AuthTest />
        </div>
        
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-xl font-semibold mb-3">Database Schema</h2>
          <p>Make sure you've run the SQL schema in your Supabase project:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Go to your <a href="https://qdyzrstyewetngfcftlf.supabase.co" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a></li>
            <li>Navigate to the SQL Editor</li>
            <li>Copy and paste the contents of <code className="bg-gray-100 px-1 rounded">supabase-schema.sql</code></li>
            <li>Run the SQL script</li>
          </ol>
        </div>
        
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-xl font-semibold mb-3">Storage Buckets</h2>
          <p>Create the following storage buckets in your Supabase project:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><code className="bg-gray-100 px-1 rounded">avatars</code> - for profile pictures</li>
            <li><code className="bg-gray-100 px-1 rounded">banners</code> - for artist banner images</li>
          </ul>
        </div>
        
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-xl font-semibold mb-3">Environment Variables</h2>
          <p className="mb-2">Make sure your <code className="bg-gray-100 px-1 rounded">.env.local</code> file has these variables set:</p>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://qdyzrstyewetngfcftlf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`}
          </pre>
        </div>
      </div>
    </div>
  );
} 