import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';
import config from '../../config/admin.json';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      
      // Validate token is still valid by calling API
      try {
        const res = await fetch('/api/config', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.status === 401) {
          // Token expired or invalid - clear and redirect to login
          localStorage.removeItem('adminToken');
          router.push('/admin/login');
          return;
        }
        
        setIsAuthorized(true);
      } catch (err) {
        console.error('Token validation failed:', err);
        setIsAuthorized(true); // Allow if network error, let API handle
      }
      setLoading(false);
    };
    
    validateToken();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - {config.app.name}</title>
      </Head>

      <div style={{ fontFamily: "'Nunito', sans-serif" }}>
        <AdminLayout />
      </div>
    </>
  );
}
