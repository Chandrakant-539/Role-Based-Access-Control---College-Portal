import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, X, ShieldCheck, GraduationCap, Briefcase, Clock, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { get, post, deleteUser } from '../services/ApiEndPoint';

const ApprovalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Logic: Crucial for Sidebar Synchronization
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await get("/api/admin/getuser");
      if (response.status === 200) {
        // Filter: Show only users where isApproved is strictly false
        const pending = response.data.users.filter((u) => !u.isApproved);
        setRequests(pending);

        // --- THE FIX: DISPATCH CUSTOM EVENT TO SYNC SIDEBAR ---
        // This tells the sidebar exactly how many requests are left
        const event = new CustomEvent("requestUpdated", { detail: pending.length });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch pending requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 2. Handle Approval: Updates role and flips isApproved to true
  const handleApprove = async (userId, role) => {
    try {
      const response = await post("/api/admin/upgrade", { 
        userId, 
        newRole: role,
        department: "SCSE" 
      });

      if (response.status === 200) {
        toast.success(`Access Granted: User verified as ${role}`);
        // Re-fetching updates local state AND triggers the sidebar sync event
        fetchRequests(); 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval logic failed");
    }
  };

  // 3. Handle Rejection: Purges the pending registration
  const handleReject = async (id) => {
    if (!window.confirm("SECURITY ALERT: Rejecting will permanently delete this registration request. Proceed?")) return;
    try {
      const response = await deleteUser(`/api/admin/delete/${id}`);
      if (response.status === 200) {
        toast.success("Registration request purged successfully");
        fetchRequests();
      }
    } catch (error) {
      toast.error("Rejection process failed");
    }
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-2xl rounded-3xl p-8 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-green-500/20 p-3 rounded-2xl">
            <UserCheck className="text-green-400" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-100 tracking-tight">Access Control Requests</h2>
            <p className="text-sm text-gray-400">Vetting required for new university registrations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl">
           <AlertCircle size={18} className="text-blue-400" />
           <span className="text-blue-400 text-sm font-black uppercase tracking-widest">
            {requests.length} Pending Actions
          </span>
        </div>
      </div>

      {/* Requests Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr className="bg-gray-900/40">
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">User Identity</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Registration Email</th>
              <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Authorize Access As</th>
              <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-20 text-gray-400 animate-pulse font-medium">Synchronizing requests...</td></tr>
              ) : requests.map((req) => (
                <motion.tr 
                  key={req._id} 
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="hover:bg-gray-700/10 transition-colors"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-blue-400 font-black border border-gray-600 shadow-inner">
                        {req.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-100">{req.name}</div>
                        <div className="text-[10px] text-gray-500 uppercase flex items-center gap-1 mt-0.5">
                          <Clock size={10} /> Pending Verification
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400 font-medium">
                    {req.email}
                  </td>

                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <div className="flex justify-center items-center gap-3">
                      <button
                        onClick={() => handleApprove(req._id, "Student")}
                        className="group flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white text-[10px] font-bold py-2 px-4 rounded-xl border border-blue-600/30 transition-all active:scale-95"
                      >
                        <GraduationCap size={14} className="group-hover:rotate-12 transition-transform" /> STUDENT
                      </button>
                      
                      <button
                        onClick={() => handleApprove(req._id, "Teacher")}
                        className="group flex items-center gap-2 bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white text-[10px] font-bold py-2 px-4 rounded-xl border border-purple-600/30 transition-all active:scale-95"
                      >
                        <Briefcase size={14} className="group-hover:rotate-12 transition-transform" /> TEACHER
                      </button>
                      
                      <button
                        onClick={() => handleApprove(req._id, "HOD")}
                        className="group flex items-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white text-[10px] font-bold py-2 px-4 rounded-xl border border-red-600/30 transition-all active:scale-95"
                      >
                        <ShieldCheck size={14} className="group-hover:rotate-12 transition-transform" /> HOD
                      </button>
                    </div>
                  </td>

                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleReject(req._id)}
                      className="group p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-lg hover:shadow-red-500/20"
                      title="Reject & Purge"
                    >
                      <X size={20} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>

            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-24">
                   <div className="flex flex-col items-center gap-3">
                      <div className="bg-gray-900/50 p-4 rounded-full border border-gray-700">
                        <ShieldCheck className="text-gray-600" size={40} />
                      </div>
                      <p className="text-gray-500 font-bold tracking-tight">Queue Clear: All registrations processed.</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default ApprovalRequests;
