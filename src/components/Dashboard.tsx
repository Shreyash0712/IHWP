import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Heart,
  User,
  ClipboardList,
  Utensils,
  Calendar,
  Bell,
  TrendingUp,
  Shield,
  LogOut,
} from 'lucide-react';
import { ProfileForm } from './ProfileForm';
import { PrakritiAssessment } from './PrakritiAssessment';
import { DietChart } from './DietChart';
import { DailySchedule } from './DailySchedule';
import { FollowUps } from './FollowUps';
import { ProgressTracking } from './ProgressTracking';
import { AdminPanel } from './AdminPanel';

type View =
  | 'overview'
  | 'profile'
  | 'assessment'
  | 'diet'
  | 'schedule'
  | 'followups'
  | 'progress'
  | 'admin';

export const Dashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('overview');
  const [hasAssessment, setHasAssessment] = useState(false);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState(0);

  useEffect(() => {
    checkAssessment();
    loadFollowUpsCount();
  }, [profile]);

  const checkAssessment = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('prakriti_assessments')
      .select('id')
      .eq('user_id', profile.id)
      .limit(1)
      .maybeSingle();

    setHasAssessment(!!data);
  };

  const loadFollowUpsCount = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('follow_ups')
      .select('id')
      .eq('user_id', profile.id)
      .eq('completed', false);

    setUpcomingFollowUps(data?.length || 0);
  };

  const handleAssessmentComplete = () => {
    setHasAssessment(true);
    setCurrentView('diet');
  };

  const navItems = [
    { id: 'profile' as View, label: 'Profile', icon: User },
    { id: 'assessment' as View, label: 'Prakriti Test', icon: ClipboardList },
    { id: 'diet' as View, label: 'Diet Chart', icon: Utensils },
    { id: 'schedule' as View, label: 'Daily Schedule', icon: Calendar },
    { id: 'followups' as View, label: 'Follow-ups', icon: Bell, badge: upcomingFollowUps },
    { id: 'progress' as View, label: 'Progress', icon: TrendingUp },
  ];

  if (profile?.is_admin) {
    navItems.push({ id: 'admin' as View, label: 'Admin Panel', icon: Shield });
  }

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <ProfileForm />;
      case 'assessment':
        return <PrakritiAssessment onComplete={handleAssessmentComplete} />;
      case 'diet':
        return <DietChart />;
      case 'schedule':
        return <DailySchedule />;
      case 'followups':
        return <FollowUps />;
      case 'progress':
        return <ProgressTracking />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Overview />;
    }
  };

  const Overview = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white p-3 rounded-full">
            <Heart className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome, {profile?.full_name}!
            </h2>
            <p className="text-green-700 text-lg">
              Your personalized Ayurvedic wellness journey
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => setCurrentView('profile')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Health Profile</h3>
          </div>
          <p className="text-gray-600">
            Manage your personal information and health details
          </p>
        </button>

        <button
          onClick={() => setCurrentView('assessment')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <ClipboardList className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {hasAssessment ? 'Retake Assessment' : 'Take Assessment'}
            </h3>
          </div>
          <p className="text-gray-600">
            {hasAssessment
              ? 'Update your Prakriti assessment'
              : 'Discover your unique Ayurvedic constitution'}
          </p>
        </button>

        <button
          onClick={() => setCurrentView('diet')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Utensils className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Diet Chart</h3>
          </div>
          <p className="text-gray-600">
            View your personalized meal recommendations
          </p>
        </button>

        <button
          onClick={() => setCurrentView('schedule')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-teal-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Daily Schedule</h3>
          </div>
          <p className="text-gray-600">
            Follow your customized daily wellness routine
          </p>
        </button>

        <button
          onClick={() => setCurrentView('followups')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left relative"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Follow-ups</h3>
            {upcomingFollowUps > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {upcomingFollowUps}
              </span>
            )}
          </div>
          <p className="text-gray-600">
            Check your reminders and scheduled follow-ups
          </p>
        </button>

        <button
          onClick={() => setCurrentView('progress')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-cyan-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Progress Tracking</h3>
          </div>
          <p className="text-gray-600">
            Monitor your wellness journey and track improvements
          </p>
        </button>
      </div>

      {!hasAssessment && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">Get Started!</h3>
          <p className="text-yellow-800 mb-4">
            Take your Prakriti assessment to unlock personalized diet and schedule recommendations.
          </p>
          <button
            onClick={() => setCurrentView('assessment')}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
          >
            Take Assessment Now
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50">
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => setCurrentView('overview')}
              className="flex items-center gap-2"
            >
              <Heart className="w-8 h-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Ayurveda Health</span>
            </button>

            <div className="flex items-center gap-4">
              <span className="text-gray-700 hidden sm:block">{profile?.email}</span>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
              <button
                onClick={() => setCurrentView('overview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  currentView === 'overview'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Overview</span>
              </button>

              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors relative ${
                    currentView === item.id
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderContent()}</main>
    </div>
  );
};
