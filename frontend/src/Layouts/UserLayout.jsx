import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.Auth.user);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Wait for Redux to initialize
    if (user !== undefined) {
      setIsLoaded(true);
    }

    // 2. If no user is logged in, kick to login page
    if (user === null) {
      navigate('/login');
      return;
    }

    // 3. SECURE GATE: If user is logged in but NOT approved
    // We allow them to stay on /dashboard to see the "Pending" message.
    // If they try to go anywhere else, we force them back to /dashboard.
    if (user && !user.isApproved && location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
  }, [user, navigate, location.pathname]);

  // Simple loading state to prevent "flash" of protected content
  if (!isLoaded || user === undefined) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-blue-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <Outlet />;
}
