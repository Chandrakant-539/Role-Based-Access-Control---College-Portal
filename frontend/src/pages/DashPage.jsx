import { 
    GraduationCap, School, Users, Clock, FileBarChart, 
    Mail, BookOpen, ShieldCheck, Calendar, Book 
} from "lucide-react";
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import UserData from "../components/common/UsersData";
import { useSelector } from "react-redux";
import { get } from "../services/ApiEndPoint";
import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";

const DashBoard = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.Auth.user);

    const [hodCount, setHodCount] = useState(0);
    const [teacherCount, setTeacherCount] = useState(0);
    const [studentCount, setStudentCount] = useState(0);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const getUserStats = async () => {
        try {
            const response = await get("/api/admin/getuser");
            if (response.status === 200) {
                const fetchedUsers = response.data.users;
                const approvedUsers = fetchedUsers.filter(u => u.isApproved);

                setHodCount(approvedUsers.filter(u => u.role === "HOD").length);
                setTeacherCount(approvedUsers.filter(u => u.role === "Teacher").length);
                setStudentCount(approvedUsers.filter(u => u.role === "Student").length);
            }
        } catch (error) {
            console.error("Dashboard Stats Error:", error);
        }
    };

    useEffect(() => {
        if (user?.role === "HOD" && user?.isApproved) {
            getUserStats();
        }
    }, [user]);

    // --- RENDER 1: WAITING ROOM (SECURITY GATE) ---
    if (user && !user.isApproved) {
        return (
            <div className="flex-1 overflow-auto relative z-10 h-screen flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-800/50 backdrop-blur-md border border-gray-700 p-10 rounded-3xl shadow-2xl max-w-lg text-center"
                >
                    <div className="flex justify-center mb-6">
                        <div className="bg-yellow-500/10 p-5 rounded-full border border-yellow-500/20">
                            <Clock className="text-yellow-500 w-14 h-14 animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Access Pending Approval</h2>
                    <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                        Hello <span className="text-blue-400 font-bold">{user.name}</span>, your registration is successful. 
                        Please wait for HOD verification.
                    </p>
                </motion.div>
            </div>
        );
    }

    // --- RENDER 2: FULL AUTHORIZED DASHBOARD ---
    return (
        <div className="flex-1 overflow-auto relative z-10 h-screen">
            <Header title={`${user?.role} Dashboard`} />

            <main className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
                
                {/* HOD VIEW: Statistics Cards */}
                {user?.role === "HOD" && (
                    <motion.div
                        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <StatCard name="Total Teachers" icon={Users} value={teacherCount} color="#6366F1" />
                        <StatCard name="Active Students" icon={Users} value={studentCount} color="#8B5CF6" />
                        <StatCard name="Department HODs" icon={GraduationCap} value={hodCount} color="#EC4899" />
                        <StatCard name="Live Reports" icon={FileBarChart} value="Available" color="#10B981" />
                    </motion.div>
                )}

                {/* TEACHER VIEW: Profile & Navigation */}
                {user?.role === "Teacher" && (
                    <div className="space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-800/40 backdrop-blur-md border border-gray-700 p-8 rounded-3xl shadow-xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <GraduationCap size={120} className="text-green-500" />
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                <div className="h-32 w-32 rounded-full bg-gradient-to-tr from-green-600 to-teal-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl border-4 border-gray-700">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 text-center md:text-left space-y-4">
                                    <div>
                                        <h2 className="text-4xl font-black text-white tracking-tight">{user?.name}</h2>
                                        <p className="text-green-400 font-bold uppercase tracking-widest text-xs mt-1">Faculty Member</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <Mail size={18} className="text-green-500" />
                                            <span className="text-sm font-medium">{user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <BookOpen size={18} className="text-green-500" />
                                            <span className="text-sm font-medium">Department: SCSE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <QuickActionCard icon={Calendar} title="My Schedule" desc="View assigned lectures" color="green" onClick={() => navigate('/schedule')} />
                            <QuickActionCard icon={Users} title="Students" desc="Manage student directory" color="blue" onClick={() => navigate('/students')} />
                            <QuickActionCard icon={Book} title="Materials" desc="Share resources" color="purple" onClick={() => navigate('/materials')} />
                        </div>
                    </div>
                )}

                {/* STUDENT VIEW: Profile & Navigation */}
                {user?.role === "Student" && (
                    <div className="space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-800/40 backdrop-blur-md border border-gray-700 p-8 rounded-3xl shadow-xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <ShieldCheck size={120} className="text-blue-500" />
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                <div className="h-32 w-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl border-4 border-gray-700">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 text-center md:text-left space-y-4">
                                    <div>
                                        <h2 className="text-4xl font-black text-white tracking-tight">{user?.name}</h2>
                                        <p className="text-blue-400 font-bold uppercase tracking-widest text-xs mt-1">University Verified Student</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <Mail size={18} className="text-blue-500" />
                                            <span className="text-sm font-medium">{user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <BookOpen size={18} className="text-blue-500" />
                                            <span className="text-sm font-medium">Dept: SCSE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <QuickActionCard icon={Calendar} title="My Timetable" desc="View weekly classes" color="purple" onClick={() => navigate('/schedule')} />
                            <QuickActionCard icon={Book} title="Course Materials" desc="Access notes" color="blue" onClick={() => navigate('/materials')} />
                        </div>
                    </div>
                )}

                {/* HOD Specific Content: Users Table */}
                <div className="mt-8">
                    {user?.role === "HOD" && <UserData />}
                </div>
            </main>
        </div>
    );
};

// Helper Component for Navigation Cards
const QuickActionCard = ({ icon: Icon, title, desc, color, onClick }) => (
    <motion.div 
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700 cursor-pointer flex items-center gap-5 transition-all hover:border-blue-500/50"
        onClick={onClick}
    >
        <div className={`bg-${color}-500/20 p-4 rounded-xl`}>
            <Icon className={`text-${color}-400`} size={28} />
        </div>
        <div>
            <h4 className="text-white font-bold text-lg">{title}</h4>
            <p className="text-gray-400 text-sm">{desc}</p>
        </div>
    </motion.div>
);

export default DashBoard;
