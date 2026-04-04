import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useNotifications(allNotifications = false) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!allNotifications) {
        query = query.eq('leida', false).limit(5);
      }

      const { data, error: err } = await query;
      if (err) throw err;

      setNotifications(data || []);
      if (allNotifications) {
        setUnreadCount((data || []).filter((n) => !n.leida).length);
      } else {
        setUnreadCount(data?.length || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const { error: err } = await supabase
        .from('notifications')
        .update({ leida: true })
        .eq('id', id);
      if (err) throw err;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.leida).map((n) => n.id);
      if (unreadIds.length === 0) return;
      const { error: err } = await supabase
        .from('notifications')
        .update({ leida: true })
        .in('id', unreadIds);
      if (err) throw err;
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}