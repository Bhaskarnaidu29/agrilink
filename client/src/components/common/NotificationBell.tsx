import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink, Loader2 } from 'lucide-react';
import api from '../../api/client';
import { Notification } from '../../types';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      // Silent fail for polling
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000); // 8-second live auto-polling
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
    setIsOpen(false);
    if (link) {
      navigate(link);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          fetchNotifications();
        }}
        className="relative p-2 rounded-xl text-gray-600 hover:text-agri-700 hover:bg-gray-100 transition focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-rose-600 rounded-full animate-pulse shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 overflow-hidden animate-fade-in divide-y divide-gray-100">
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-agri-400" />
              <span className="font-bold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-agri-500 text-slate-950 rounded-full text-[10px] font-extrabold">
                  {unreadCount} New
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-[11px] font-semibold text-agri-300 hover:text-white flex items-center gap-1"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2 opacity-50" />
                No notifications yet.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id, item.link)}
                  className={`p-3.5 hover:bg-agri-50/60 transition cursor-pointer flex items-start gap-3 ${
                    !item.isRead ? 'bg-amber-50/30 font-semibold' : 'opacity-85'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!item.isRead ? 'bg-agri-600' : 'bg-transparent'}`} />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900">{item.title}</span>
                      <span className="text-[10px] text-gray-400 font-normal">{formatTimeAgo(item.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-snug font-normal">{item.message}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-1" />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
