import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile, FollowUp } from '../lib/supabase';
import { Users, Calendar, Plus, X } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userFollowUps, setUserFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpForm, setFollowUpForm] = useState({
    title: '',
    description: '',
    follow_up_type: 'reminder',
    scheduled_date: '',
  });

  useEffect(() => {
    if (profile?.is_admin) {
      loadUsers();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedUser) {
      loadUserFollowUps();
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_admin', false)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setUsers(data);
    }
    setLoading(false);
  };

  const loadUserFollowUps = async () => {
    if (!selectedUser) return;

    const { data, error } = await supabase
      .from('follow_ups')
      .select('*')
      .eq('user_id', selectedUser)
      .order('scheduled_date', { ascending: true });

    if (data && !error) {
      setUserFollowUps(data);
    }
  };

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !profile) return;

    const { error } = await supabase.from('follow_ups').insert([
      {
        user_id: selectedUser,
        title: followUpForm.title,
        description: followUpForm.description,
        follow_up_type: followUpForm.follow_up_type,
        scheduled_date: new Date(followUpForm.scheduled_date).toISOString(),
        created_by: profile.id,
      },
    ]);

    if (!error) {
      setShowFollowUpForm(false);
      setFollowUpForm({
        title: '',
        description: '',
        follow_up_type: 'reminder',
        scheduled_date: '',
      });
      loadUserFollowUps();
    }
  };

  const deleteFollowUp = async (followUpId: string) => {
    if (!confirm('Are you sure you want to delete this follow-up?')) return;

    const { error } = await supabase.from('follow_ups').delete().eq('id', followUpId);

    if (!error) {
      loadUserFollowUps();
    }
  };

  if (!profile?.is_admin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-800">You do not have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading users...</div>
      </div>
    );
  }

  const selectedUserData = users.find((u) => u.id === selectedUser);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-gray-700" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
            <p className="text-gray-600">Manage users and follow-ups</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Users</h3>
            {users.length === 0 ? (
              <p className="text-gray-600 text-sm">No users found.</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedUser === user.id
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{user.full_name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {!selectedUser ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a user to manage their follow-ups</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedUserData?.full_name}
                    </h3>
                    <p className="text-gray-600">{selectedUserData?.email}</p>
                  </div>
                  <button
                    onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Follow-up
                  </button>
                </div>

                {selectedUserData && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm text-gray-600">Age:</span>
                      <span className="ml-2 font-medium">
                        {selectedUserData.age || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Gender:</span>
                      <span className="ml-2 font-medium capitalize">
                        {selectedUserData.gender || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Height:</span>
                      <span className="ml-2 font-medium">
                        {selectedUserData.height ? `${selectedUserData.height} cm` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Weight:</span>
                      <span className="ml-2 font-medium">
                        {selectedUserData.weight ? `${selectedUserData.weight} kg` : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {showFollowUpForm && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Create New Follow-up
                  </h4>
                  <form onSubmit={handleCreateFollowUp} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={followUpForm.title}
                        onChange={(e) =>
                          setFollowUpForm({ ...followUpForm, title: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={followUpForm.follow_up_type}
                        onChange={(e) =>
                          setFollowUpForm({ ...followUpForm, follow_up_type: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="reminder">Reminder</option>
                        <option value="check_in">Check-in</option>
                        <option value="assessment">Assessment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scheduled Date
                      </label>
                      <input
                        type="datetime-local"
                        value={followUpForm.scheduled_date}
                        onChange={(e) =>
                          setFollowUpForm({ ...followUpForm, scheduled_date: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={followUpForm.description}
                        onChange={(e) =>
                          setFollowUpForm({ ...followUpForm, description: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Create Follow-up
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowFollowUpForm(false)}
                        className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Follow-ups</h4>
                {userFollowUps.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No follow-ups scheduled for this user.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userFollowUps.map((followUp) => (
                      <div
                        key={followUp.id}
                        className={`p-4 rounded-lg border-2 ${
                          followUp.completed
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-semibold text-gray-900">
                                {followUp.title}
                              </h5>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  followUp.completed
                                    ? 'bg-gray-200 text-gray-700'
                                    : 'bg-green-200 text-green-800'
                                }`}
                              >
                                {followUp.follow_up_type}
                              </span>
                              {followUp.completed && (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-200 text-green-800">
                                  Completed
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {new Date(followUp.scheduled_date).toLocaleString()}
                            </p>
                            {followUp.description && (
                              <p className="text-sm text-gray-700">{followUp.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteFollowUp(followUp.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
