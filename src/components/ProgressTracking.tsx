import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ProgressTracking as ProgressTrackingType } from '../lib/supabase';
import { TrendingUp, Calendar, Plus, Activity } from 'lucide-react';

export const ProgressTracking: React.FC = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressTrackingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tracking_date: new Date().toISOString().split('T')[0],
    weight: '',
    energy_level: '5',
    sleep_quality: '5',
    stress_level: '5',
    notes: '',
  });

  useEffect(() => {
    loadProgress();
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('progress_tracking')
      .select('*')
      .eq('user_id', user.id)
      .order('tracking_date', { ascending: false })
      .limit(30);

    if (data && !error) {
      setProgressData(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('progress_tracking').insert([
      {
        user_id: user?.id,
        tracking_date: formData.tracking_date,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        energy_level: parseInt(formData.energy_level),
        sleep_quality: parseInt(formData.sleep_quality),
        stress_level: parseInt(formData.stress_level),
        notes: formData.notes || null,
      },
    ]);

    if (!error) {
      setShowForm(false);
      setFormData({
        tracking_date: new Date().toISOString().split('T')[0],
        weight: '',
        energy_level: '5',
        sleep_quality: '5',
        stress_level: '5',
        notes: '',
      });
      loadProgress();
    }
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

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'bg-green-100';
    if (score >= 5) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading progress data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Progress Tracking</h2>
              <p className="text-blue-700">Monitor your wellness journey</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Entry
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">New Progress Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.tracking_date}
                  onChange={(e) =>
                    setFormData({ ...formData, tracking_date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Energy Level (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.energy_level}
                  onChange={(e) =>
                    setFormData({ ...formData, energy_level: e.target.value })
                  }
                  className="w-full"
                />
                <div className="text-center font-semibold text-gray-900">
                  {formData.energy_level}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sleep Quality (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.sleep_quality}
                  onChange={(e) =>
                    setFormData({ ...formData, sleep_quality: e.target.value })
                  }
                  className="w-full"
                />
                <div className="text-center font-semibold text-gray-900">
                  {formData.sleep_quality}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stress Level (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.stress_level}
                  onChange={(e) =>
                    setFormData({ ...formData, stress_level: e.target.value })
                  }
                  className="w-full"
                />
                <div className="text-center font-semibold text-gray-900">
                  {formData.stress_level}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="How are you feeling? Any observations?"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save Entry
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {progressData.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No progress entries yet. Add your first entry above!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {progressData.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">
                    {formatDate(entry.tracking_date)}
                  </span>
                </div>
                {entry.weight && (
                  <div className="text-gray-700">
                    <span className="font-semibold">Weight:</span> {entry.weight} kg
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                {entry.energy_level && (
                  <div className={`${getScoreBg(entry.energy_level)} rounded-lg p-3`}>
                    <div className="text-sm text-gray-600 mb-1">Energy</div>
                    <div className={`text-2xl font-bold ${getScoreColor(entry.energy_level)}`}>
                      {entry.energy_level}/10
                    </div>
                  </div>
                )}

                {entry.sleep_quality && (
                  <div className={`${getScoreBg(entry.sleep_quality)} rounded-lg p-3`}>
                    <div className="text-sm text-gray-600 mb-1">Sleep</div>
                    <div className={`text-2xl font-bold ${getScoreColor(entry.sleep_quality)}`}>
                      {entry.sleep_quality}/10
                    </div>
                  </div>
                )}

                {entry.stress_level && (
                  <div className={`${getScoreBg(11 - entry.stress_level)} rounded-lg p-3`}>
                    <div className="text-sm text-gray-600 mb-1">Stress</div>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(
                        11 - entry.stress_level
                      )}`}
                    >
                      {entry.stress_level}/10
                    </div>
                  </div>
                )}
              </div>

              {entry.notes && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-900">{entry.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
