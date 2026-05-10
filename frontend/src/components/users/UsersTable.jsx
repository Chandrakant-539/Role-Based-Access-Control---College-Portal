import { useState, useEffect } from "react";
import ProfileModal from '../ProfileModal';
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash, Eye, Users } from "lucide-react";

import { useSelector } from "react-redux";
import { toast } from "react-hot-toast"; 
import { deleteUser, get } from '../../services/ApiEndPoint';

const UsersTable = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const user = useSelector((state) => state.Auth.user);

  // 1. Fetch Approved Users only
  const fetchUsers = async () => {
    try {
      const response = await get("/api/admin/getuser");
      if (response.status === 200) {
        // We only show users who have passed the HOD vetting process
        const approvedUsers = response.data.users.filter((u) => u.isApproved);
        setUsers(approvedUsers);
        setFilteredUsers(approvedUsers); 
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load active directory");
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  // 2. Dynamic Search Functionality
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // 3. User Deletion with Cleanup
  const handleDelete = async (id) => {
    if (!window.confirm("CRITICAL: Deleting this user will remove all their data and schedule associations. Proceed?")) return;
    try {
      const response = await deleteUser(`/api/admin/delete/${id}`);
      if (response.status === 200) {
        toast.success("User successfully purged from system");
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Purge failed");
    }
  };

  return (
    <div className="relative">
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
                <Users className="text-blue-400" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-100 tracking-tight">Active User Directory</h2>
          </div>
          
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Filter by name, email, or role..."
              className="bg-gray-700/50 text-white placeholder-gray-400 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full border border-gray-600 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr className="bg-gray-900/30">
                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Identity</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Email Contact</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">System Status</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700">
              <AnimatePresence>
                {filteredUsers.map((u) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-gray-700/20 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-100">{u.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {u.email}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${
                        u.role === 'HOD' ? 'bg-purple-900/30 text-purple-300 border-purple-700' :
                        u.role === 'Teacher' ? 'bg-green-900/30 text-green-300 border-green-700' : 
                        'bg-blue-900/30 text-blue-300 border-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-green-400">Verified</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all"
                          onClick={() => setSelectedUser(u)}
                          title="Open Security Profile"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                          onClick={() => handleDelete(u._id)}
                          title="Purge User Record"
                        >
                          <Trash size={16} /> 
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-500 italic">No verified records found in active directory.</p>
          </div>
        )}
      </motion.div>

      {/* MODAL MOUNT - Rendered outside of the main table box to avoid clipping */}
      <AnimatePresence>
        {selectedUser && (
          <ProfileModal 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsersTable;
