import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile, FollowUp } from '../lib/supabase';
import { Users, Calendar, Plus, X, User as UserIcon, Mail, Clock } from 'lucide-react';

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
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Prakriti Wellness Analyzer</h2>
            <p className="text-white/90">Manage users and follow-ups</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary-600" />
                Users
              </h3>
            </div>
            <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto">
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No users found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all transform hover:scale-[1.02] ${
                        selectedUser === user.id
                          ? 'bg-primary-50 border-2 border-primary-500 shadow-sm'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-100 p-2 rounded-lg">
                          <UserIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          {!selectedUser ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="bg-gray-100 p-4 rounded-full inline-block mb-6">
                <Users className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a User</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Choose a user from the list to view and manage their follow-ups
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-6 py-4 border-b border-primary-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-primary-600" />
                        {selectedUserData?.full_name}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {selectedUserData?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                      className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-2 rounded-xl font-medium hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md"
                    >
                      <Plus className="w-5 h-5" />
                      Add Follow-up
                    </button>
                  </div>
                </div>

                {selectedUserData && (
                  <div className="p-6">
                    <h4 className="text-sm font-medium text-gray-500 uppercase mb-3">User Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Age</div>
                        <div className="font-medium text-gray-900">
                          {selectedUserData.age || 'N/A'}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Gender</div>
                        <div className="font-medium text-gray-900 capitalize">
                          {selectedUserData.gender || 'N/A'}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Height</div>
                        <div className="font-medium text-gray-900">
                          {selectedUserData.height ? `${selectedUserData.height} cm` : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Weight</div>
                        <div className="font-medium text-gray-900">
                          {selectedUserData.weight ? `${selectedUserData.weight} kg` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {showFollowUpForm && (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">Create New Follow-up</h4>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleCreateFollowUp} className="space-y-5">
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Follow-up title"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows={3}
                          placeholder="Add details about this follow-up..."
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-lg font-medium hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md"
                        >
                          Create Follow-up
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowFollowUpForm(false)}
                          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    Follow-ups
                  </h3>
                </div>
                <div className="p-6">
                  {userFollowUps.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
                        <Calendar className="w-10 h-10 text-gray-500" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Follow-ups</h4>
                      <p className="text-gray-600 max-w-md mx-auto">
                        No follow-ups scheduled for this user. Click "Add Follow-up" to create one.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userFollowUps.map((followUp) => (
                        <div
                          key={followUp.id}
                          className={`p-5 rounded-xl border-2 transition-all ${
                            followUp.completed
                              ? 'bg-gray-50 border-gray-200'
                              : 'bg-primary-50 border-primary-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-semibold text-gray-900">
                                  {followUp.title}
                                </h5>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    followUp.completed
                                      ? 'bg-gray-200 text-gray-700'
                                      : 'bg-primary-200 text-primary-800'
                                  }`}
                                >
                                  {followUp.follow_up_type}
                                </span>
                                {followUp.completed && (
                                  <span className="px-2 py-1 text-xs rounded-full bg-accent-200 text-accent-800">
                                    Completed
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                                <Clock className="w-4 h-4" />
                                {new Date(followUp.scheduled_date).toLocaleString()}
                              </div>
                              {followUp.description && (
                                <p className="text-sm text-gray-700 bg-white p-3 rounded-lg">
                                  {followUp.description}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => deleteFollowUp(followUp.id)}
                              className="ml-4 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
