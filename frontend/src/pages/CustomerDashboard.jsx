import React from 'react';
import { Link } from 'react-router-dom';

export default function CustomerDashboard() {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-900">construction</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">SkilledWorker</h1>
                </div>
                <nav className="flex-1 px-4 space-y-1 mt-4">
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/20 text-slate-900 dark:text-slate-100 font-semibold group" to="#">
                        <span className="material-symbols-outlined text-slate-900 dark:text-slate-100 group-hover:scale-110 transition-transform">dashboard</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group" to="#">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">person_search</span>
                        <span>Browse Workers</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group" to="#">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">handyman</span>
                        <span>Equipment</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group" to="#">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">work_history</span>
                        <span>My Jobs</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group" to="#">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">chat_bubble</span>
                        <span>Messages</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 p-2">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <img alt="Profile picture" data-alt="Close up portrait of a professional male user" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8LzFUaytmVjONkGJ8al5F1szj9Kwk3V0S4-UL0tbruCUOfB4TtvdUPg9_wCnTHQ8_L7iN-0aJNL05GthSjfSP03WeijcOjKmGXeaGFNN5HLJCEo4F5nGrm1kfyJLqVLJr8a0u19a6_pgLQisV_bXRZjMSF6I51XGkGba9GcG9Qt4wCVt8OZUbfzaz4KZLAozSPXXBqG0OzPQzDhRQ4u47ryVLcSTNuzlRO7ay7xywLou7p7meka67Yb5Wpo13U9bPw5tHK4pnMBk" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">Alex Johnson</p>
                            <p className="text-xs text-slate-500 truncate">Premium Customer</p>
                        </div>
                    </div>
                </div>
            </aside>
            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex-1 max-w-lg">
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary">search</span>
                            <input className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 text-sm transition-all" placeholder="Search for workers, equipment, or history..." type="text" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                    </div>
                </header>
                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Top Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Customer Dashboard Overview</h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your professional bookings and active equipment rentals.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all">
                                    <span className="material-symbols-outlined">add</span>
                                    Post a New Job
                                </button>
                                <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-secondary/20 transition-all">
                                    <span className="material-symbols-outlined">shopping_cart</span>
                                    Book Equipment
                                </button>
                            </div>
                        </div>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 group">
                                <div className="w-14 h-14 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue group-hover:scale-105 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">task</span>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Jobs</p>
                                    <p className="text-2xl font-bold">12</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 group">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">event_available</span>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Upcoming Bookings</p>
                                    <p className="text-2xl font-bold">5</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 group">
                                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">mark_chat_unread</span>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Unread Messages</p>
                                    <p className="text-2xl font-bold">3</p>
                                </div>
                            </div>
                        </div>
                        {/* Recent Bookings Table */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-lg font-bold">Recent Bookings</h3>
                                <button className="text-sm font-semibold text-accent-blue hover:underline">View All</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service / Worker</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cost</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-slate-700 dark:text-slate-300 text-sm">electric_bolt</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">Electrical Wiring</p>
                                                        <p className="text-xs text-slate-500">David Miller</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">Oct 12, 2023</td>
                                            <td className="px-6 py-4 text-sm font-medium">$450.00</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Confirmed</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-slate-400 hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined">more_horiz</span>
                                                </button>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-slate-700 dark:text-slate-300 text-sm">plumbing</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">Pipe Installation</p>
                                                        <p className="text-xs text-slate-500">Sarah Chen</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">Oct 10, 2023</td>
                                            <td className="px-6 py-4 text-sm font-medium">$280.00</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pending</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-slate-400 hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined">more_horiz</span>
                                                </button>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-slate-700 dark:text-slate-300 text-sm">square_foot</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">Cabinet Carpentry</p>
                                                        <p className="text-xs text-slate-500">Mike Ross</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">Oct 05, 2023</td>
                                            <td className="px-6 py-4 text-sm font-medium">$1,200.00</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Completed</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-slate-400 hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined">more_horiz</span>
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* Recommended Workers */}
                        <div>
                            <h3 className="text-lg font-bold mb-4">Recommended for You</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 group cursor-pointer hover:border-primary transition-all">
                                    <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg mb-3 overflow-hidden">
                                        <img alt="Worker profile" className="w-full h-full object-cover" data-alt="Portrait of a friendly smiling male worker in a yellow hardhat" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALTfaRZn1tIBdNPEVP9fcmuBrS9LSuxwRC-gtl-T2v1vsiBve-QJgYlW8Cz68QuU-ovGhSsWDlv0MlfmgDWH5vQNqmzwTCHgsLazfW7nvPJfmAlS59yh3GsG0OmxwWUXqDo1bCvgdtMiqfk14uvdeRF61Vu-BZGqTjuTbc4Xex9STF1QEx9TsRq_PDu8dJ-QXBtZOHoRUHW7em_7x4O9b09A16h8LyzQ9AXvMRaGDsnSN0s9wtOP16jkEMKQedu_rNQSHEgRnlriE" />
                                    </div>
                                    <h4 className="font-bold text-sm">John D.</h4>
                                    <p className="text-xs text-slate-500">Master Plumber • 4.9★</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs font-bold text-primary">$45/hr</span>
                                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary text-sm">arrow_forward</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 group cursor-pointer hover:border-primary transition-all">
                                    <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg mb-3 overflow-hidden">
                                        <img alt="Worker profile" className="w-full h-full object-cover" data-alt="Portrait of a professional female electrician holding a multimeter" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt9E7r2HYsG_MwdoaPGDBaU1edfuUrEPc4cT_RUbmBRNPO13SR776uSUIsJta2Ca0pbTrCis986gvL33G2iglb1I8lSaULrAfnPH5i48cFf7WQa-1sU29dQWBHWVr3RhO4EeDLLiD0E4Q_kP9sGT7CGuisw1SUjme_oEEVwpT7w1pAFVKBn38FB8O-UQW7543WPKbIvj6CLaEFZir26pLW6Ks0nG-lmFOMiOaflS2eKpfXqvbaBy2IutudkKlshRilvtAEmFCHxJA" />
                                    </div>
                                    <h4 className="font-bold text-sm">Maria S.</h4>
                                    <p className="text-xs text-slate-500">Electrician • 4.8★</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs font-bold text-primary">$60/hr</span>
                                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary text-sm">arrow_forward</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 group cursor-pointer hover:border-primary transition-all">
                                    <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg mb-3 overflow-hidden">
                                        <img alt="Worker profile" className="w-full h-full object-cover" data-alt="Female contractor looking at a digital tablet on a job site" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqOHKFEdkuBOIu0DvQRUXCNQEBDVI4pgLMz3DNrGJRJq9p7gFPanNKRonmOJHZbotXDJRDPZ5qyLSmHavm_ZAmOFo5VNzfHVzfWKIEL2ILPhGkt411Om_6OvQUYsONLft_Hkyt7PkwbCWndeSXsOgrePwx_j8wij8WgNtSy-vXqpl7TDdG7dHXFiAZu8xBuzwaYgMl8X1Z1uZI5tmFiQgvAe_mVuXw2QB3MH4ixQmbLLGyu1k_1ZinNRZwkbljOMqPcoDjocTcyx0" />
                                    </div>
                                    <h4 className="font-bold text-sm">Elena K.</h4>
                                    <p className="text-xs text-slate-500">Project Manager • 5.0★</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs font-bold text-primary">$85/hr</span>
                                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary text-sm">arrow_forward</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 group cursor-pointer hover:border-primary transition-all">
                                    <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-300">group_add</span>
                                    </div>
                                    <h4 className="font-bold text-sm">Find More</h4>
                                    <p className="text-xs text-slate-500">200+ available workers</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400">Browse all</span>
                                        <span className="material-symbols-outlined text-slate-300 text-sm">arrow_forward</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
