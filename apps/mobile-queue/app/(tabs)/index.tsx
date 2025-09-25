import { useAuth } from '@clerk/clerk-expo';
import { useEffect } from 'react';

import { Dashboard } from '@/components/dashboard';
import { MainLayout } from '@/components/main-layout';

export default function DashboardScreen() {
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchAndLogToken = async () => {
      try {
        // Get the JWT token
        const token = await getToken();
        console.log('🔐 Clerk JWT Token:', token);
      } catch (error) {
        console.error('❌ Error fetching Clerk token:', error);
      }
    };

    fetchAndLogToken();
  }, [getToken]);

  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
}
