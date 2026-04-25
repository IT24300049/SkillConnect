import { useState, useEffect } from 'react';
import { complaintAPI } from '../api';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const FILE_BASE_URL = 'http://localhost:8083';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintAPI.getAll()
      .then((r) => setComplaints(r.data.data || []))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = (id, status) => {
    complaintAPI.updateStatus(id, status)
      .then(() => {
        toast.success('Status updated');
        complaintAPI.getAll().then((r) => setComplaints(r.data.data || []));
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed'));
  };

  const resolveImageUrl = (url) => {
    if (!url) {
      return '';
    }
    const clean = String(url).trim();
    if (/^https?:\/\//i.test(clean)) {
      return clean;
    }
    if (clean.startsWith('/')) {
      return `${FILE_BASE_URL}${clean}`;
    }
    return `${FILE_BASE_URL}/${clean}`;
  };

  if (loading) return <div className="spinner mx-auto mt-12" />;

  return (
    <div>
      <h1 className="page-title mb-6">All Complaints</h1>
      {complaints.length === 0 ? (
        <EmptyState title="No complaints" />
      ) : (
        <div className="hm-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-3 font-semibold">Title</th>
                <th className="text-left p-3 font-semibold">Category</th>
                <th className="text-left p-3 font-semibold">Evidence</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.complaintId} className="border-b last:border-0">
                  <td className="p-3">{c.complaintTitle}</td>
                  <td className="p-3">{c.complaintCategory}</td>
                  <td className="p-3">
                    {Array.isArray(c.complaintImages) && c.complaintImages.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {c.complaintImages.map((img) => (
                          <a
                            key={img.complaintImageId || img.imageUrl}
                            href={resolveImageUrl(img.imageUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded border border-slate-200 overflow-hidden"
                          >
                            <img
                              src={resolveImageUrl(img.imageUrl)}
                              alt="Complaint evidence"
                              className="w-12 h-12 object-cover block"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No images</span>
                    )}
                  </td>
                  <td className="p-3"><StatusBadge status={c.complaintStatus} /></td>
                  <td className="p-3">
                    <select
                      value={c.complaintStatus}
                      onChange={(e) => updateStatus(c.complaintId, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
