import { 
	BarChart2, 
	GraduationCap, 
	Menu, 
	Settings, 
	Calendar, 
	Notebook, 
	Users, 
	LucideLogOut, 
	UserCheck,
	School, 
	FileBarChart 
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"; 
import { post, get } from "../../services/ApiEndPoint";
import { Logout } from "../../Redux/AuthSlice";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom"; 

const SIDEBAR_ITEMS = [
	{
		name: "Dashboard",
		icon: BarChart2,
		color: "#6366f1",
		href: "/dashboard",
	},
	{ 
		name: "Approval Requests", 
		icon: UserCheck, 
		color: "#10B981", 
		href: "/approvals" 
	},
	{ name: "Schedule", icon: Calendar, color: "#8B5CF6", href: "/schedule" },
	{ name: "Users", icon: Users, color: "#EC4899", href: "/users" },
	{ name: "Teachers", icon: GraduationCap, color: "#10B981", href: "/teachers" },
	{ name: "Students", icon: Notebook, color: "#F59E0B", href: "/students" },
	{ name: "Materials", icon: School, color: "#3B82F6", href: "/materials" },
	{ name: "Reports", icon: FileBarChart, color: "#F97316", href: "/reports" },
	{ name: "Settings", icon: Settings, color: "#6EE7B7", href: "/settings" },
];

const Sidebar = () => {
	const user = useSelector((state) => state.Auth.user);
	const userRole = user ? user.role : null;
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [pendingCount, setPendingCount] = useState(0);
	
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();

	// --- NOTIFICATION & REAL-TIME SYNC LOGIC ---
	useEffect(() => {
		const fetchPendingCount = async () => {
			if (userRole === "HOD" && user?.isApproved) {
				try {
					const response = await get("/api/admin/getuser");
					if (response.status === 200) {
						const pending = response.data.users.filter(u => !u.isApproved).length;
						setPendingCount(pending);
					}
				} catch (error) {
					console.error("Sidebar Badge Error:", error);
				}
			}
		};

		// 1. Listen for the 'requestUpdated' event from ApprovalRequests page
		const handleSyncUpdate = (event) => {
			// This sets the count to exactly what the page sees in real-time
			setPendingCount(event.detail);
		};

		window.addEventListener("requestUpdated", handleSyncUpdate);

		// 2. Initial fetch when sidebar mounts
		fetchPendingCount();

		// 3. Fallback: Refresh badge count every 2 minutes
		const interval = setInterval(fetchPendingCount, 120000);

		return () => {
			window.removeEventListener("requestUpdated", handleSyncUpdate);
			clearInterval(interval);
		};
	}, [userRole, user?.isApproved]);

	const filteredSidebarItems = SIDEBAR_ITEMS.filter((item) => {
		if (userRole === 'HOD') return true;
		if (userRole === 'Teacher') {
			return ['Dashboard', 'Students', 'Materials', 'Schedule', 'Settings'].includes(item.name);
		}
		if (userRole === 'Student') {
			return ['Dashboard', 'Materials', 'Schedule', 'Settings'].includes(item.name);
		}
		return false; 
	});

	const logout = async () => {
		try {
			const request = await post('/api/auth/logout');
			if (request.status === 200) {
				toast.success(request.data.message);
				dispatch(Logout());
				navigate('/login');
			}
		} catch (error) {
			toast.error(error.response?.data?.message || "Logout failed");
		}
	};

	return (
		<motion.div
			className={`relative z-50 transition-all duration-300 ease-in-out flex-shrink-0 ${
				isSidebarOpen ? "w-64" : "w-20"
			}`}
			animate={{ width: isSidebarOpen ? 256 : 80 }}
		>
			<div className='h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700'>
				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className='p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit mb-4'
				>
					<Menu size={24} />
				</motion.button>

				<nav className='mt-4 flex-grow'>
					{filteredSidebarItems.map((item) => {
						const isActive = location.pathname === item.href;
						return (
							<Link key={item.href} to={item.href}>
								<motion.div 
									className={`flex items-center p-4 text-sm font-medium rounded-lg transition-all mb-2 relative ${
										isActive ? "bg-gray-700 text-white shadow-lg" : "hover:bg-gray-700/50 text-gray-400"
									}`}
								>
									<item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
									
									<AnimatePresence>
										{isSidebarOpen && (
											<motion.span
												className='ml-4 whitespace-nowrap'
												initial={{ opacity: 0, width: 0 }}
												animate={{ opacity: 1, width: "auto" }}
												exit={{ opacity: 0, width: 0 }}
											>
												{item.name}
											</motion.span>
										)}
									</AnimatePresence>

									{/* --- NOTIFICATION BADGE (RED DOT) --- */}
									{item.name === "Approval Requests" && pendingCount > 0 && (
										<div className={`absolute ${isSidebarOpen ? "right-4" : "right-2 top-2"} flex h-2 w-2`}>
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
											<span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
										</div>
									)}

									{/* Active Indicator Line */}
									{isActive && (
										<motion.div 
											layoutId="activeTab"
											className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
										/>
									)}
								</motion.div>
							</Link>
						);
					})}
				</nav>

				{/* Logout Section */}
				<motion.div 
					className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-red-900/20 transition-all cursor-pointer mt-auto group"
					onClick={logout}
				>
					<LucideLogOut size={20} className="text-red-500 group-hover:scale-110 transition-transform" style={{ minWidth: "20px" }} />
					<AnimatePresence>
						{isSidebarOpen && (
							<motion.span
								className="ml-4 whitespace-nowrap text-red-400 font-bold"
								initial={{ opacity: 0, width: 0 }}
								animate={{ opacity: 1, width: "auto" }}
								exit={{ opacity: 0, width: 0 }}
							>
								Logout
							</motion.span>
						)}
					</AnimatePresence>
				</motion.div>
			</div>
		</motion.div>
	);
};

export default Sidebar;
