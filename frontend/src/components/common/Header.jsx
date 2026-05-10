import React from 'react';
import { useSelector } from 'react-redux';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

const Header = ({ title }) => {
	// Access the user data from Redux state
	const user = useSelector((state) => state.Auth.user);

	return (
		<header className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700 sticky top-0 z-20'>
			<div className='max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center'>
				
				{/* Page Title */}
				<h1 className='text-2xl font-semibold text-gray-100'>{title}</h1>

				{/* User Status Section */}
				{user && (
					<div className='flex items-center space-x-4'>
						<div className='hidden sm:flex flex-col items-end mr-2'>
							<span className='text-sm font-medium text-gray-200'>{user.name}</span>
							<span className={`text-[10px] font-bold uppercase tracking-widest ${
								user.role === 'HOD' ? 'text-purple-400' : 
								user.role === 'Teacher' ? 'text-green-400' : 'text-blue-400'
							}`}>
								{user.role}
							</span>
						</div>

						{/* Approval Status Badge */}
						<div className={`flex items-center px-3 py-1 rounded-full border ${
							user.isApproved 
								? 'bg-green-900/20 border-green-800 text-green-400' 
								: 'bg-yellow-900/20 border-yellow-800 text-yellow-500 animate-pulse'
						}`}>
							{user.isApproved ? (
								<>
									<ShieldCheck size={14} className='mr-1.5' />
									<span className='text-[10px] font-bold uppercase'>Verified</span>
								</>
							) : (
								<>
									<ShieldAlert size={14} className='mr-1.5' />
									<span className='text-[10px] font-bold uppercase'>Pending</span>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</header>
	);
};

export default Header;
