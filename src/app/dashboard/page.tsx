'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  console.log("Session Data:", session);
  

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Sign out
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-700">ID:</p>
                <p className="text-gray-900">{session.user.id}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Name:</p>
                <p className="text-gray-900">{session.user.name}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Email:</p>
                <p className="text-gray-900">{session.user.email}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Username:</p>
                <p className="text-gray-900">{session.user.username}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Phone:</p>
                <p className="text-gray-900">{session.user.phone_number}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Role:</p>
                <p className="text-gray-900">{session.user.role}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Address:</p>
                <p className="text-gray-900">{session.user.address}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Created At:</p>
                <p className="text-gray-900">{new Date(session.user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Session Data</h2>
          <div className="bg-gray-50 p-6 rounded-lg overflow-auto">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}