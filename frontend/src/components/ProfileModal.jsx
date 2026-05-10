import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';

// Hardcoded permissions map to match your UI requirements exactly
const PERMISSIONS_MAP = {
  HOD: [
    "Full System Access",
    "Delete/Edit Any User",
    "Assign Roles & Permissions",
    "Access Department Reports",
    "Modify Academic Schedules"
  ],
  Teacher: [
    "View Assigned Classes",
    "Manage Student Attendance",
    "Upload Study Materials",
    "Input/Edit Exam Grades",
    "Communicate with Students"
  ],
  Student: [
    "View Personal Profile",
    "Access Course Materials",
    "View Internal Grades",
    "Submit Online Assignments",
    "Check Class Timetables"
  ]
};

const ProfileModal = ({ user, onClose }) => {
  if (!user) return null;

  // Get permissions based on role, default to empty array if role not found
  const permissions = PERMISSIONS_MAP[user.role] || ["No specific permissions assigned"];

  return (
    // Find this line in your ProfileModal.jsx
<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transform transition-all"
      >
        
        {/* Header - Vibrant Blue to match your screenshots */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-tight">User Security Profile</h2>
            <button 
              onClick={onClose} 
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 bg-white">
          
          {/* Left Column: Profile Card */}
          <div className="flex flex-col items-center text-center border-b md:border-b-0 md:border-r pb-6 md:pb-0 border-gray-100 pr-0 md:pr-8">
            <div className="w-28 h-28 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl font-bold mb-4 border-4 border-white shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 leading-tight">{user.name}</h3>
            <p className="text-gray-500 text-sm font-medium mb-4">{user.email}</p>
            
            {/* Dynamic Role Badge */}
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              user.role === 'HOD' ? 'bg-purple-100 text-purple-700' : 
              user.role === 'Teacher' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {user.role}
            </span>
          </div>

          {/* Right Column: Permissions List */}
          <div className="md:col-span-2">
            <h4 className="text-[11px] font-black text-gray-400 uppercase mb-5 tracking-[0.2em]">Active Permissions</h4>
            <div className="space-y-3">
              {permissions.map((perm, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center p-4 bg-gray-50/80 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                >
                  <div className="text-blue-500 mr-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-gray-700 text-sm font-semibold">{perm}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="bg-gray-50 p-4 px-8 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95"
          >
            Close Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileModal;
