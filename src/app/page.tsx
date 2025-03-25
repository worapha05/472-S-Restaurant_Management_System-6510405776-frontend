'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';

export default function WelcomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
      // Check if user is authenticated
      if (status === 'unauthenticated') {
        router.push('/login');
        return;
      }
  
      // Fetch user data
      const fetchUserData = async () => {
        if (status === 'authenticated' && session?.user?.id) {
          if (session.user.role === 'ADMIN') {
            router.push('/about');
          } else if (session.user.role === 'STAFF') {
            router.push('/orders');
          } else if (session.user.role === 'USER') {
            router.push('/menus');
          }
        }
      };
  
      fetchUserData();
    }, [session, status, router]);


  return (
    <Loading message="กําลังโหลด..." />
  );
}
