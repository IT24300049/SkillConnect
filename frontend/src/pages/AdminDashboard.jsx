import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-10 py-4 sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-2 rounded-lg flex items-center justify-center text-background-dark">
                            <span className="material-symbols-outlined">construction</span>
                        </div>
                        <h2 className="text-slate-900 dark:text-slate-100 text-xl font-extrabold tracking-tight">SkilledWorker <span className="text-primary font-medium">Admin</span></h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link className="text-primary text-sm font-semibold border-b-2 border-primary pb-1" to="#">Dashboard</Link>
                        <Link className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-medium transition-colors" to="#">User Management</Link>
                        <Link className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-medium transition-colors" to="#">Content Moderation</Link>
                        <Link className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-medium transition-colors" to="#">Settings</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <label className="relative hidden lg:block">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <span className="material-symbols-outlined text-lg">search</span>
                        </span>
                        <input className="block w-64 rounded-lg border-none bg-slate-100 dark:bg-slate-800 py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="Search platform..." type="text" />
                    </label>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/20 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Alex Rivers</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Super Admin</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-primary/30 border-2 border-primary/50 flex items-center justify-center overflow-hidden" data-alt="Admin user profile photo">
                                <span className="material-symbols-outlined text-primary">account_circle</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 py-8">
                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Platform Overview</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time health monitoring and growth analytics for SkilledWorker.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                            <span className="material-symbols-outlined text-lg">calendar_today</span>
                            Last 30 Days
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark rounded-lg text-sm font-bold hover:opacity-90 transition-opacity shadow-sm">
                            <span className="material-symbols-outlined text-lg">download</span>
                            Export Report
                        </button>
                    </div>
                </div>
                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <span className="material-symbols-outlined">group</span>
                            </div>
                            <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">trending_up</span> 12%
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Users</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">12,450</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <span className="material-symbols-outlined">engineering</span>
                            </div>
                            <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">trending_up</span> 5%
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Workers</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">3,820</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                <span className="material-symbols-outlined">report_problem</span>
                            </div>
                            <span className="text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">trending_down</span> 8%
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Open Complaints</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">42</h3>
                    </div>
                </div>
                {/* Charts and Detailed Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Main Chart Area */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Bookings over Time</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Projected vs actual platform service volume</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                                    <span className="text-xs font-medium text-slate-500">Actual</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full border border-dashed border-primary"></span>
                                    <span className="text-xs font-medium text-slate-500">Projected</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative h-[300px] w-full">
                            {/* Placeholder for Chart Implementation using SVG path */}
                            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#13ecec" stopOpacity="0.3"></stop>
                                        <stop offset="100%" stopColor="#13ecec" stopOpacity="0"></stop>
                                    </linearGradient>
                                </defs>
                                {/* Area Fill */}
                                <path d="M0,250 C100,230 200,260 300,180 C400,100 500,150 600,120 C700,90 800,40 900,60 C950,70 1000,30 1000,30 L1000,300 L0,300 Z" fill="url(#chartGradient)"></path>
                                {/* Main Line */}
                                <path d="M0,250 C100,230 200,260 300,180 C400,100 500,150 600,120 C700,90 800,40 900,60 C950,70 1000,30 1000,30" fill="none" stroke="#13ecec" strokeLinecap="round" strokeWidth="4"></path>
                                {/* Grid Lines */}
                                <line className="text-slate-100 dark:text-slate-700/50" stroke="currentColor" strokeDasharray="4" x1="0" x2="1000" y1="50" y2="50"></line>
                                <line className="text-slate-100 dark:text-slate-700/50" stroke="currentColor" strokeDasharray="4" x1="0" x2="1000" y1="125" y2="125"></line>
                                <line className="text-slate-100 dark:text-slate-700/50" stroke="currentColor" strokeDasharray="4" x1="0" x2="1000" y1="200" y2="200"></line>
                            </svg>
                            {/* X-Axis Labels */}
                            <div className="flex justify-between mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                                <span>Week 1</span>
                                <span>Week 2</span>
                                <span>Week 3</span>
                                <span>Week 4</span>
                                <span>Today</span>
                            </div>
                        </div>
                    </div>
                    {/* Platform Distribution */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Service Distribution</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Most requested skilled trades</p>
                        <div className="space-y-6 flex-1">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-semibold">
                                    <span>Plumbing</span>
                                    <span>42%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full w-[42%]"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-semibold">
                                    <span>Electrical</span>
                                    <span>28%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary/70 h-full w-[28%]"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-semibold">
                                    <span>Carpentry</span>
                                    <span>18%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary/50 h-full w-[18%]"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-semibold">
                                    <span>HVAC Repair</span>
                                    <span>12%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary/30 h-full w-[12%]"></div>
                                </div>
                            </div>
                        </div>
                        <button className="mt-8 w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-primary/20 hover:text-primary transition-all">
                            View Full Analysis
                        </button>
                    </div>
                </div>
                {/* Recent Complaints Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Recent Complaints</h2>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50">Filter</button>
                            <button className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-slate-900 dark:bg-slate-700 text-white rounded-lg">View All</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50">
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Complaint ID</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Reported</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                <tr>
                                    <td className="px-8 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">#CMP-9402</td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200" data-alt="User Avatar"></div>
                                            <div className="text-sm">
                                                <p className="font-bold text-slate-900 dark:text-slate-100">Jordan Smith</p>
                                                <p className="text-slate-500 text-xs">Customer</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-sm text-slate-600 dark:text-slate-300">Incomplete service - Plumber left before testing leaks</td>
                                    <td className="px-8 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 24, 2023</td>
                                    <td className="px-8 py-4">
                                        <select defaultValue="Open" className="bg-red-50 dark:bg-red-900/20 border-none text-red-600 text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-red-500">
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                        </select>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">more_horiz</span>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-8 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">#CMP-9381</td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200" data-alt="User Avatar"></div>
                                            <div className="text-sm">
                                                <p className="font-bold text-slate-900 dark:text-slate-100">Maria Garcia</p>
                                                <p className="text-slate-500 text-xs">Worker</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-sm text-slate-600 dark:text-slate-300">Payment dispute - Client refusing final milestone</td>
                                    <td className="px-8 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 23, 2023</td>
                                    <td className="px-8 py-4">
                                        <select defaultValue="Resolved" className="bg-green-50 dark:bg-green-900/20 border-none text-green-600 text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-green-500">
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                        </select>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">more_horiz</span>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-8 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">#CMP-9377</td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200" data-alt="User Avatar"></div>
                                            <div className="text-sm">
                                                <p className="font-bold text-slate-900 dark:text-slate-100">David Chen</p>
                                                <p className="text-slate-500 text-xs">Customer</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-sm text-slate-600 dark:text-slate-300">Tardiness - Electrician arrived 3 hours late</td>
                                    <td className="px-8 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 22, 2023</td>
                                    <td className="px-8 py-4">
                                        <select defaultValue="In Progress" className="bg-yellow-50 dark:bg-yellow-900/20 border-none text-yellow-600 text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-yellow-500">
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                        </select>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">more_horiz</span>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="px-8 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <p className="text-xs text-slate-500 font-medium tracking-tight">Showing 3 of 42 open complaints</p>
                        <div className="flex gap-2">
                            <button className="p-1.5 border border-slate-200 dark:border-slate-600 rounded-md text-slate-400 hover:text-primary">
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            <button className="p-1.5 border border-slate-200 dark:border-slate-600 rounded-md text-slate-400 hover:text-primary">
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            {/* Footer */}
            <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark py-6 px-10">
                <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-400 font-medium">© 2024 SkilledWorker Platform. System Status: <span className="text-green-500">All services operational</span></p>
                    <div className="flex gap-6">
                        <Link className="text-xs text-slate-400 hover:text-primary font-bold uppercase tracking-wider transition-colors" to="#">Privacy Policy</Link>
                        <Link className="text-xs text-slate-400 hover:text-primary font-bold uppercase tracking-wider transition-colors" to="#">Terms of Service</Link>
                        <Link className="text-xs text-slate-400 hover:text-primary font-bold uppercase tracking-wider transition-colors" to="#">Support Portal</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
