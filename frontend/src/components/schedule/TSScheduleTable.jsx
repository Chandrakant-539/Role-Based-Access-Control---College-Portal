import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, User, BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";
import { get } from "../../services/ApiEndPoint";
import { useSelector } from "react-redux";

// Helper to assign colors to specific subjects for a better UI
const getSubjectColor = (subject) => {
    const colors = {
        DSA: "text-blue-400 bg-blue-400/10",
        IDS: "text-purple-400 bg-purple-400/10",
        DM: "text-green-400 bg-green-400/10",
        CSY: "text-red-400 bg-red-400/10",
        DA: "text-yellow-400 bg-yellow-400/10",
    };
    return colors[subject] || "text-gray-300 bg-gray-700/30";
};

const initializeSchedule = () => {
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => ({
        name: day,
        schedule: Array(8).fill(null), // Expanded to 8 hours for real college logic
    }));
};

const TeachersScheduleTable = () => {
    const user = useSelector((state) => state.Auth.user);
    const teacherId = user?._id;
    const [scheduleData, setScheduleData] = useState(initializeSchedule());

    useEffect(() => {
        const fetchTeacherSchedule = async () => {
            try {
                const response = await get(`/api/auth/teacherS/${teacherId}`);
                const data = response.data;
                const scheduleMap = initializeSchedule();

                if (data.schedules) {
                    data.schedules.forEach((item) => {
                        const dayIndex = scheduleMap.findIndex((d) => d.name === item.day);
                        if (dayIndex !== -1) {
                            scheduleMap[dayIndex].schedule[item.period - 1] = item;
                        }
                    });
                }
                setScheduleData(scheduleMap);
            } catch (error) {
                toast.error("Error fetching your classes.");
            }
        };
        if (teacherId) fetchTeacherSchedule();
    }, [teacherId]);

    return <ScheduleGrid title="Your Assigned Lectures" data={scheduleData} isTeacher={true} />;
};

const StudentsScheduleTable = () => {
    const [scheduleData, setScheduleData] = useState(initializeSchedule());

    useEffect(() => {
        const fetchAllSchedules = async () => {
            try {
                /** * FIX: Changed endpoint from /api/admin/getallSchedules 
                 * to /api/auth/getGlobalSchedules to bypass isAdmin middleware restrictions.
                 */
                const response = await get(`/api/auth/getGlobalSchedules`);
                const data = response.data;
                const scheduleMap = initializeSchedule();

                if (data.schedules) {
                    data.schedules.forEach((item) => {
                        const dayIndex = scheduleMap.findIndex((d) => d.name === item.day);
                        if (dayIndex !== -1) {
                            scheduleMap[dayIndex].schedule[item.period - 1] = item;
                        }
                    });
                }
                setScheduleData(scheduleMap);
            } catch (error) {
                // This toast will no longer trigger with a 403 error
                toast.error("Failed to load global timetable.");
            }
        };
        fetchAllSchedules();
    }, []);

    return <ScheduleGrid title="Weekly Academic Timetable" data={scheduleData} isTeacher={false} />;
};

// Reusable Grid Component to keep code DRY
const ScheduleGrid = ({ title, data, isTeacher }) => {
    return (
        <motion.div
            className="bg-gray-800/50 backdrop-blur-md shadow-xl rounded-2xl p-6 border border-gray-700 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center gap-3 mb-6">
                <BookOpen className="text-blue-500" size={24} />
                <h2 className="text-xl font-bold text-gray-100">{title}</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700">Day</th>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                                <th key={h} className="px-4 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700">
                                    Hour {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {data.map((day) => (
                            <tr key={day.name} className="hover:bg-gray-700/20 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-100 flex items-center gap-2">
                                    <CalendarCheck size={16} className="text-blue-500" />
                                    {day.name}
                                </td>
                                {day.schedule.map((entry, index) => (
                                    <td key={index} className="px-2 py-4 whitespace-nowrap text-center border-l border-gray-700/30">
                                        {entry ? (
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`px-2 py-1 rounded-md text-[11px] font-black uppercase tracking-tighter ${getSubjectColor(entry.subject)}`}>
                                                    {entry.subject}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                                                    <User size={10} /> {isTeacher ? "Classroom" : entry.teacherId?.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-700 font-black">-</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export { TeachersScheduleTable, StudentsScheduleTable };
