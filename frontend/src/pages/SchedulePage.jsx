import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from "framer-motion";
import { Calendar, Clock, Info, BookOpen, User  } from 'lucide-react';
import Header from "../components/common/Header";
import { StudentsScheduleTable, TeachersScheduleTable } from "../components/schedule/TSScheduleTable";
import ScheduleTable from "../components/schedule/ScheduleTable"; // HOD Management View

const SchedulePage = () => {
    const user = useSelector((state) => state.Auth.user);

    return (
        <div className="flex-1 overflow-auto relative z-10 h-screen bg-gray-900">
            <Header title="Class Schedule" />
            
            <main className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* INFO HEADER SECTION */}
                    <div className="flex items-center justify-between mb-8 bg-blue-600/10 border border-blue-500/20 p-5 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-500 p-3 rounded-xl text-white shadow-lg shadow-blue-500/20">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {user?.role === "HOD" ? "Schedule Management Portal" : "Academic Timetable"}
                                </h2>
                                <p className="text-xs text-gray-400 mt-1">
                                    {user?.role === "Student" && "View your weekly lectures and classroom timings."}
                                    {user?.role === "Teacher" && "Monitor your assigned teaching hours and classes."}
                                    {user?.role === "HOD" && "Assign faculty members to slots and optimize department flow."}
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock size={14} />
                                <span>Session: 2025-26</span>
                            </div>
                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                                Live System
                            </span>
                        </div>
                    </div>

                    {/* DYNAMIC CONTENT AREA */}
                    <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700 p-6 rounded-3xl shadow-xl">
                        
                        {/* 1. STUDENT VIEW */}
                        {user?.role === "Student" && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4 text-blue-400">
                                    <BookOpen size={18} />
                                    <span className="text-sm font-bold tracking-widest uppercase">Student Weekly View</span>
                                </div>
                                <StudentsScheduleTable />
                            </div>
                        )}

                        {/* 2. TEACHER VIEW */}
                        {user?.role === "Teacher" && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4 text-green-400">
                                    <User size={18} />
                                    <span className="text-sm font-bold tracking-widest uppercase">Faculty Lecture Plan</span>
                                </div>
                                <TeachersScheduleTable />
                            </div>
                        )}

                        {/* 3. HOD VIEW (The Assignment Interface) */}
                        {user?.role === "HOD" && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4 text-purple-400">
                                    <Info size={18} />
                                    <span className="text-sm font-bold tracking-widest uppercase">Management & Allocation</span>
                                </div>
                                <ScheduleTable />
                            </div>
                        )}

                        {/* FALLBACK */}
                        {!["Student", "Teacher", "HOD"].includes(user?.role) && (
                            <div className="text-center py-20">
                                <p className="text-gray-500 font-medium">Access Restricted: Role not recognized.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default SchedulePage;
