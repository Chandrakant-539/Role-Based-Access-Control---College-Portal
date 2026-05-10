import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

// Layouts & Global Components
import Sidebar from "./components/common/Sidebar";
import PublicLayout from "./Layouts/PublicLayout";
import UserLayout from "./Layouts/UserLayout";
import AdminLayout from "./Layouts/AdminLayout";

// Pages
import DashBoard from "./pages/DashPage";
import SchedulePage from "./pages/SchedulePage"; // Name updated for clarity
import UsersPage from "./pages/UsersPage";
import ApprovalRequests from "./pages/ApprovalRequests"; 
import Teachers from "./pages/TeachersPage";
import Students from "./pages/StudentsPage";
import SettingsPage from "./pages/SettingsPage";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage";
import NotFound from "./components/common/Notfound";

/**
 * Placeholder views for new modules. 
 * You can move these to separate files in the /pages folder later.
 */
const MaterialsPage = () => (
	<div className="p-8">
		<h1 className="text-2xl font-bold text-white mb-4">Academic Materials</h1>
		<div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
			<p className="text-gray-400 font-medium">Access your course notes, textbooks, and assignments here.</p>
		</div>
	</div>
);

const ReportsPage = () => (
	<div className="p-8">
		<h1 className="text-2xl font-bold text-white mb-4">System & Departmental Reports</h1>
		<div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
			<p className="text-gray-400 font-medium">Detailed analytics and departmental audits (HOD Only Access).</p>
		</div>
	</div>
);

function App() {
	const user = useSelector((state) => state.Auth.user);
	
	return (
		<div className='flex h-screen bg-gray-900 text-gray-100 overflow-hidden relative'>
			{/* Professional Gradient Background */}
			<div className='fixed inset-0 z-0'>
				<div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-90' />
				<div className='absolute inset-0 backdrop-blur-[2px]' />
			</div>

			{/* Sidebar Visibility Logic */}
			{user && <Sidebar />}

			<div className="relative z-10 flex-1 overflow-auto">
				<Routes>
					{/* --- PUBLIC ACCESS --- */}
					<Route element={<PublicLayout />}>
						<Route path="/" element={<Navigate to="/login" />} />
						<Route path="/login" element={<Login />} />
						<Route path="/signup" element={<Signup />} />
					</Route>

					{/* --- AUTHENTICATED USER ROUTES (Student/Teacher/HOD) --- */}
					<Route element={<UserLayout />}>
						<Route path='/dashboard' element={<DashBoard />} />
						<Route path='/settings' element={<SettingsPage />} />
						
						{/* Schedule Page: Now renders Dynamically based on Role */}
						<Route path='/schedule' element={<SchedulePage />} />
						
						{/* Materials: Varies by access permissions */}
						<Route path='/materials' element={<MaterialsPage />} />
					</Route>

					{/* --- FACULTY & MANAGEMENT ROUTES --- */}
					<Route element={<UserLayout />}>
						<Route path='/students' element={<Students />} />
					</Route>

					{/* --- ADMINISTRATIVE GATEWAY (HOD ONLY) --- */}
					<Route element={<AdminLayout />}>
						<Route path='/users' element={<UsersPage />} />
						<Route path='/approvals' element={<ApprovalRequests />} />
						<Route path='/teachers' element={<Teachers />} />
						
						{/* Analytics & Auditing */}
						<Route path='/reports' element={<ReportsPage />} />
					</Route>

					{/* --- ERROR HANDLING --- */}
					<Route path="*" element={<NotFound />} />
				</Routes>
			</div>
		</div>
	);
}

export default App;
