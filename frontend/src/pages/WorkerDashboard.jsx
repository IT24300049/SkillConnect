import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { jobAPI, bookingAPI, workerAPI } from '../api';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ jobs: 0, bookings: 0, rating: 0, earnings: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [jobsRes, bookingsRes, profileRes] = await Promise.allSettled([
          jobAPI.getAll({}),
          bookingAPI.getMine('worker'),
          workerAPI.getMe(),
        ]);

        const jobs = jobsRes.status === 'fulfilled' ? jobsRes.value?.data?.data || [] : [];
        const bookings = bookingsRes.status === 'fulfilled' ? bookingsRes.value?.data?.data || [] : [];
        const profile = profileRes.status === 'fulfilled' ? profileRes.value?.data?.data : null;

        setStats({
          jobs: jobs.length,
          bookings: bookings.length,
          rating: profile?.averageRating || 0,
          earnings: profile?.totalEarnings || 0,
        });
        setRecentJobs(jobs.slice(0, 5));
      } catch { /* non-critical */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const name = user?.email?.split('@')[0] || 'Worker';

  return (
    <div className="fade-in space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#152a2a] to-[#1e3b3b] rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#13ecec]/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <p className="text-xs font-bold tracking-widest uppercase text-[#13ecec] mb-1">Worker Dashboard</p>
          <h1 className="text-2xl md:text-3xl font-black mb-1">Hello, {name}</h1>
          <p className="text-sm text-slate-300">Find and manage your work opportunities</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Available Jobs', value: stats.jobs, icon: 'work', color: 'bg-blue-50 text-blue-600' },
          { label: 'My Bookings', value: stats.bookings, icon: 'task_alt', color: 'bg-green-50 text-green-600' },
          { label: 'Avg. Rating', value: stats.rating ? stats.rating.toFixed(1) : '0.0', icon: 'star', color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Total Earnings', value: `Rs.${stats.earnings.toLocaleString()}`, icon: 'payments', color: 'bg-purple-50 text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <span className="material-symbols-outlined text-xl">{s.icon}</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={() => navigate('/jobs')} className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="w-11 h-11 rounded-lg bg-[#13ecec]/10 text-[#0ea5a5] flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-xl">search</span>
          </div>
          <p className="text-sm font-bold text-slate-900">Browse Jobs</p>
          <p className="text-xs text-slate-500">Find new work opportunities</p>
        </button>
        <button onClick={() => navigate('/bookings')} className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="w-11 h-11 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-xl">calendar_today</span>
          </div>
          <p className="text-sm font-bold text-slate-900">My Schedule</p>
          <p className="text-xs text-slate-500">View upcoming bookings</p>
        </button>
        <button onClick={() => navigate('/messages')} className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-xl">chat</span>
          </div>
          <p className="text-sm font-bold text-slate-900">Messages</p>
          <p className="text-xs text-slate-500">Chat with customers</p>
        </button>
      </div>

      {/* Recent Available Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Available Jobs</h2>
          <button onClick={() => navigate('/jobs')} className="text-[#13ecec] text-sm font-semibold hover:underline flex items-center gap-1">
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><span className="spinner" /></div>
        ) : recentJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">work_off</span>
            <p className="text-slate-500">No jobs available right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentJobs.map(job => (
              <div key={job.jobId || job.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-500">work</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{job.jobTitle || job.title}</p>
                    <p className="text-xs text-slate-500">{job.district || 'N/A'} &bull; {job.urgencyLevel || 'Standard'}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  job.urgencyLevel === 'urgent' || job.urgencyLevel === 'emergency'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-green-50 text-green-600'
                }`}>
                  {job.jobStatus || job.status || 'Active'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
