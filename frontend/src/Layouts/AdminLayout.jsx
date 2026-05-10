import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.Auth.user);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. If user is undefined (still loading from Redux), do nothing yet
    if (user === undefined) return;

    // 2. If no user is logged in at all, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }

    // 3. SECURE GATE: Check Role
    if (user.role !== 'HOD') {
      toast.error("Access Denied: Administrative privileges required.");
      navigate('/dashboard'); 
      return;
    }

    // 4. SECURE GATE: Check Approval Status
    // Even an HOD cannot access Admin pages until another HOD (or the system) approves them
    if (!user.isApproved) {
      toast.error("Access Restricted: Your Admin account is pending verification.");
      navigate('/dashboard'); 
      return;
    }

    // If all checks pass, authorize the view
    setIsAuthorized(true);

  }, [user, navigate]);

  // Prevent "flicker" of admin content while checking authorization
  if (!isAuthorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <Outlet />;
}
