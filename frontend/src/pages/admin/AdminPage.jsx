import React from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';
import { Users, FileText, Database, DollarSign } from 'lucide-react';

export default function AdminPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => { const res = await client.get('/admin/stats'); return res.data.data; }
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => { const res = await client.get('/admin/users'); return res.data.data; }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="glass-card h-32 rounded-xl shimmer"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={<Users size={24} className="text-primary" />} />
          <StatCard title="Total Expenses" value={stats?.totalExpenses || 0} icon={<DollarSign size={24} className="text-success" />} />
          <StatCard title="Total Reports" value={stats?.totalReports || 0} icon={<FileText size={24} className="text-secondary" />} />
          <StatCard title="Storage Used" value={stats?.storageUsed || '0 MB'} icon={<Database size={24} className="text-warning" />} />
        </div>
      )}

      <div className="glass-card rounded-xl overflow-hidden mt-8">
        <div className="p-4 border-b border-gray-700/50">
          <h2 className="text-lg font-bold text-white">System Users</h2>
        </div>
        
        {usersLoading ? (
          <div className="p-4 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="shimmer h-12 rounded w-full"></div>)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs uppercase bg-gray-800/50 text-gray-400">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Joined Date</th>
                  <th className="px-6 py-3">Expenses Logged</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id || i} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                    <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs text-white ${u.role === 'admin' ? 'bg-primary' : 'bg-gray-700'}`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold">{u.expenseCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="glass-card p-6 rounded-xl flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <div className="p-4 bg-gray-800/80 rounded-full">{icon}</div>
    </div>
  );
}
