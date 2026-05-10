import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { post } from '../services/ApiEndPoint';
import { toast } from 'react-hot-toast';
import { motion } from "framer-motion";
import { ShieldCheck, UserPlus } from 'lucide-react';

const Signup = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		role: "Student", // Enforced for Gated Approval system
		department: "",
	});
	const [isMatching, setIsMatching] = useState(false);

	// Validation logic for real-time password matching
	useEffect(() => {
		if (formData.confirmPassword === "" || formData.password === "") {
			setIsMatching(false);
		} else {
			setIsMatching(formData.password === formData.confirmPassword);
		}
	}, [formData.password, formData.confirmPassword]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isMatching) {
			toast.error("Passwords do not match");
			return;
		}

		try {
			// Sends registration request with role "Student" and isApproved as false (backend default)
			const request = await post('/api/auth/register', formData);
			if (request.status === 200) {
				toast.success("Registration Successful! Please wait for HOD approval.");
				navigate('/login');
			}
		} catch (error) {
			toast.error(error.response?.data?.message || "Registration failed");
		}
	};

	return (
		<motion.div
			className="flex items-center justify-center min-h-screen bg-gray-900 px-4"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			<div className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-gray-700 max-w-md w-full">
				<div className="flex flex-col items-center mb-6">
					<div className="bg-blue-600 p-3 rounded-full mb-3 shadow-lg">
						<UserPlus className="text-white" size={28} />
					</div>
					<h2 className="text-2xl font-bold text-center text-gray-100">Create Account</h2>
					<p className="text-gray-400 text-xs mt-1">Join the academic portal</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="name" className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Name</label>
						<input
							type="text"
							name="name"
							id="name"
							className="bg-gray-700/50 text-white placeholder-gray-500 rounded-xl w-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition-all"
							placeholder="Enter full name"
							value={formData.name}
							onChange={handleChange}
							required
						/>
					</div>

					<div>
						<label htmlFor="email" className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Email</label>
						<input
							type="email"
							name="email"
							id="email"
							className="bg-gray-700/50 text-white placeholder-gray-500 rounded-xl w-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition-all"
							placeholder="university@email.com"
							value={formData.email}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label htmlFor="password" className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Password</label>
							<input
								type="password"
								name="password"
								id="password"
								className="bg-gray-700/50 text-white placeholder-gray-500 rounded-xl w-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition-all"
								placeholder="••••••••"
								value={formData.password}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<label htmlFor="confirmPassword" className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Confirm</label>
							<input
								type="password"
								name="confirmPassword"
								id="confirmPassword"
								className={`bg-gray-700/50 text-white placeholder-gray-500 rounded-xl w-full px-4 py-2.5 focus:outline-none focus:ring-2 transition-all border ${
									formData.confirmPassword === "" 
										? "focus:ring-blue-500 border-gray-600" 
										: isMatching
											? "ring-green-500 border-green-500"
											: "ring-red-500 border-red-500"
								}`}
								placeholder="••••••••"
								value={formData.confirmPassword}
								onChange={handleChange}
								required
							/>
						</div>
					</div>

					{/* --- GATED ROLE FIELD (System Enforced) --- */}
					<div className="bg-gray-900/40 p-4 rounded-xl border border-dashed border-gray-600">
						<div className="flex items-center justify-between mb-2">
							<label htmlFor="role" className="text-gray-400 text-xs font-bold uppercase tracking-wider">Default Role</label>
							<ShieldCheck className="text-blue-500" size={16} />
						</div>
						<input
							type="text"
							name="role"
							id="role"
							value="Student"
							readOnly
							className="bg-transparent text-blue-400 font-bold text-sm w-full cursor-not-allowed outline-none"
						/>
						<p className="text-[10px] text-gray-500 mt-2 leading-tight">
							Security Note: Accounts are created as 'Student' pending HOD verification for elevated roles.
						</p>
					</div>

					<div>
						<label htmlFor="department" className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Department</label>
						<input
							type="text"
							name="department"
							id="department"
							className="bg-gray-700/50 text-white placeholder-gray-500 rounded-xl w-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition-all"
							placeholder="e.g., SCSE"
							value={formData.department}
							onChange={handleChange}
							required
						/>
					</div>

					<button
						type="submit"
						className={`w-full text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform active:scale-95 ${
							isMatching
								? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20"
								: "bg-gray-600 cursor-not-allowed opacity-50"
						}`}
						disabled={!isMatching}
					>
						Register Account
					</button>
				</form>

				<p className="text-gray-400 text-sm text-center mt-6">
					Already have an account?{" "}
					<Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium underline-offset-4 hover:underline transition-all">
						Log In
					</Link>
				</p>
			</div>
		</motion.div>
	);
};

export default Signup;
