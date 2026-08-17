import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '../api/notifications';
import { Bell, AlertCircle, Info, TrendingUp, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationsAPI.getNotifications();
      return res.data.data;
    }
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsAPI.markRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsAPI.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('All marked as read');
    }
  });

  const getIcon = (type) => {
    switch(type) {
      case 'alert': return <AlertCircle className="text-danger" size={20} />;
      case 'success': return <CheckCircle2 className="text-success" size={20} />;
      case 'insight': return <TrendingUp className="text-secondary" size={20} />;
      default: return <Info className="text-primary" size={20} />;
    }
  };

  const handleMarkRead = (id, isRead) => {
    if (!isRead) markReadMutation.mutate(id);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold gradient-text">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={() => markAllReadMutation.mutate()} 
            disabled={markAllReadMutation.isPending}
            className="text-sm px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition disabled:opacity-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="glass-card h-24 rounded-xl shimmer"></div>)
        ) : notifications.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-xl flex flex-col items-center">
            <Bell size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400">You're all caught up!</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              onClick={() => handleMarkRead(notif.id, notif.isRead)}
              className={`glass-card p-4 rounded-xl flex items-start space-x-4 cursor-pointer transition ${!notif.isRead ? 'bg-gray-800/80 border-l-4 border-l-primary' : 'opacity-70 hover:opacity-100'}`}
            >
              <div className="mt-1 bg-gray-900 p-2 rounded-full">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className={`font-semibold ${!notif.isRead ? 'text-white' : 'text-gray-300'}`}>{notif.title}</h4>
                  <span className="text-xs text-gray-500">{new Date(notif.createdAt).toLocaleDateString()}</span>
                </div>
                <p className={`text-sm mt-1 ${!notif.isRead ? 'text-gray-300' : 'text-gray-500'}`}>{notif.message}</p>
              </div>
              {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
