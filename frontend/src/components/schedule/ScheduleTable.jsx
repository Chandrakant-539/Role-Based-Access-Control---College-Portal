import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Trash2, CalendarCheck, Plus, BookOpen, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { get, post } from "../../services/ApiEndPoint";

const SUBJECTS = ["DSA", "IDS", "DM", "CSY", "DA"];

const ScheduleTable = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [scheduleData, setScheduleData] = useState([]);
    const [rawSchedules, setRawSchedules] = useState([]);

    const dayMap = { Monday: "M", Tuesday: "T", Wednesday: "W", Thursday: "Th", Friday: "F" };
    const reverseDayMap = { M: "Monday", T: "Tuesday", W: "Wednesday", Th: "Thursday", F: "Friday" };

    const initializeSchedule = () => {
        return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => ({
            name: day,
            schedule: Array(8).fill(null) // Real College Logic: 8 Periods
        }));
    };

    const fetchAllSchedules = async () => {
        try {
            const response = await get("/api/admin/getallSchedules");
            const data = response.data;
            setRawSchedules(data.schedules || []);

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
            toast.error("Error fetching unified timetable");
        }
    };

    useEffect(() => {
        fetchAllSchedules();
    }, []);

    const handleAssign = (dayName, periodIndex) => {
        setSelectedDay(dayName);
        setSelectedPeriod(periodIndex + 1);
        setSelectedTeacher("");
        setSelectedSubject("");
        
        // Fetch teachers who are free during this day/period
        const fetchTeachers = async () => {
            try {
                const response = await get(`/api/admin/available?day=${dayName}&period=${periodIndex + 1}`);
                setAvailableTeachers(response.data.data);
            } catch (error) {
                toast.error("Failed to fetch available faculty.");
            }
        };
        fetchTeachers();
        setShowPopup(true);
    };

    const handleAssignTeacher = async () => {
        if (!selectedTeacher || !selectedSubject) {
            toast.error("Subject and Teacher are required.");
            return;
        }

        try {
            const response = await post(`/api/admin/assignS`, {
                subject: selectedSubject,
                teacherId: selectedTeacher,
                day: selectedDay,
                period: selectedPeriod,
            });

            toast.success(response.data.message);
            setShowPopup(false);
            fetchAllSchedules();
        } catch (error) {
            toast.error(error.response?.data?.message || "Conflict Detected");
        }
    };

    const handleDelete = async (scheduleId) => {
        if (!window.confirm("Remove this assignment?")) return;
        try {
            const response = await post(`/api/admin/deleteS/${scheduleId}`);
            toast.success(response.data.message);
            fetchAllSchedules();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    return (
        <motion.div
            className="bg-gray-800/50 backdrop-blur-md shadow-xl rounded-3xl p-8 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-100 tracking-tight">Department Schedule Manager</h2>
                    <p className="text-sm text-gray-400 mt-1">Assign faculty to time-slots for unified view</p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-700/50">
                <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-gray-900/40">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Day</th>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                                <th key={h} className="px-4 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-widest">Hour {h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {scheduleData.map((day) => (
                            <tr key={day.name} className="hover:bg-gray-700/10 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <CalendarCheck size={16} className="text-blue-500" /> {day.name}
                                    </div>
                                </td>
                                {day.schedule.map((entry, index) => (
                                    <td key={index} className="px-2 py-4 whitespace-nowrap text-center border-l border-gray-700/30">
                                        {entry ? (
                                            <div className="group relative flex flex-col items-center gap-1 bg-blue-500/5 p-2 rounded-xl border border-blue-500/10 hover:border-red-500/50 transition-all">
                                                <span className="text-[11px] font-black text-blue-400 uppercase tracking-tighter">{entry.subject}</span>
                                                <span className="text-[9px] text-gray-500 font-bold uppercase">{entry.teacherId?.name}</span>
                                                <button 
                                                    onClick={() => handleDelete(entry._id)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleAssign(day.name, index)}
                                                className="p-2 text-gray-600 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ASSIGNMENT MODAL */}
            <AnimatePresence>
                {showPopup && (
                    <div className="fixed inset-0 z-[100] flex justify-center items-center bg-gray-900/80 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-800 border border-gray-700 rounded-3xl p-8 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <BookOpen size={20} className="text-blue-500" /> Assign Resource
                                </h3>
                                <button onClick={() => setShowPopup(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-700/30 p-3 rounded-2xl border border-gray-700">
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Day</p>
                                        <p className="text-white font-bold">{selectedDay}</p>
                                    </div>
                                    <div className="bg-gray-700/30 p-3 rounded-2xl border border-gray-700">
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Time Slot</p>
                                        <p className="text-white font-bold">Hour {selectedPeriod}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Select Subject</label>
                                    <select
                                        className="w-full bg-gray-900 text-white rounded-xl p-3 outline-none border border-gray-700 focus:border-blue-500 transition-all"
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                    >
                                        <option value="">Choose Subject...</option>
                                        {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Available Faculty</label>
                                    <select
                                        className="w-full bg-gray-900 text-white rounded-xl p-3 outline-none border border-gray-700 focus:border-blue-500 transition-all"
                                        value={selectedTeacher}
                                        onChange={(e) => setSelectedTeacher(e.target.value)}
                                    >
                                        <option value="">Choose Teacher...</option>
                                        {availableTeachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>

                                <button
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
                                    onClick={handleAssignTeacher}
                                    disabled={!selectedTeacher || !selectedSubject}
                                >
                                    Confirm Assignment
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ScheduleTable;
