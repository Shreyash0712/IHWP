import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, FollowUp } from '../lib/supabase';
import { Bell, CheckCircle, Calendar, AlertCircle } from 'lucide-react';

export const FollowUps: React.FC = () => {
  const { user } = useAuth();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowUps();
  }, [user]);

  const loadFollowUps = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('follow_ups')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: true });

    if (data && !error) {
      setFollowUps(data);
    }
    setLoading(false);
  };

  const markAsCompleted = async (followUpId: string) => {
    const { error } = await supabase
      .from('follow_ups')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', followUpId);

    if (!error) {
      loadFollowUps();
    }
  };

  const isOverdue = (scheduledDate: string, completed: boolean) => {
    if (completed) return false;
    return new Date(scheduledDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading follow-ups...</div>
      </div>
    );
  }

  const upcomingFollowUps = followUps.filter((f) => !f.completed);
  const completedFollowUps = followUps.filter((f) => f.completed);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-teal-50 to-green-50 border border-teal-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-teal-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Follow-ups & Reminders</h2>
            <p className="text-teal-700">Stay on track with your wellness journey</p>
          </div>
        </div>
      </div>

      {upcomingFollowUps.length === 0 && completedFollowUps.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No follow-ups scheduled yet.</p>
        </div>
      )}

      {upcomingFollowUps.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Follow-ups</h3>
          <div className="space-y-4">
            {upcomingFollowUps.map((followUp) => {
              const overdue = isOverdue(followUp.scheduled_date, followUp.completed);
              return (
                <div
                  key={followUp.id}
                  className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
                    overdue ? 'border-red-500' : 'border-green-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {overdue && <AlertCircle className="w-5 h-5 text-red-600" />}
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {followUp.title}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            overdue
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {followUp.follow_up_type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(followUp.scheduled_date)}</span>
                        {overdue && (
                          <span className="text-red-600 font-medium">(Overdue)</span>
                        )}
                      </div>

                      {followUp.description && (
                        <p className="text-gray-700 mb-4">{followUp.description}</p>
                      )}

                      {followUp.notes && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Notes:</span> {followUp.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => markAsCompleted(followUp.id)}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Completed
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {completedFollowUps.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Completed Follow-ups</h3>
          <div className="space-y-4">
            {completedFollowUps.map((followUp) => (
              <div
                key={followUp.id}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{followUp.title}</h4>
                    <div className="text-sm text-gray-600">
                      <p>Scheduled: {formatDate(followUp.scheduled_date)}</p>
                      {followUp.completed_at && (
                        <p>Completed: {formatDate(followUp.completed_at)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
