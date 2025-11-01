import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, DailyScheduleTemplate, PrakritiAssessment } from '../lib/supabase';
import { Calendar, Clock, Sunrise, Sun, Sunset, Moon, Lightbulb } from 'lucide-react';

export const DailySchedule: React.FC = () => {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<PrakritiAssessment | null>(null);
  const [scheduleTemplates, setScheduleTemplates] = useState<DailyScheduleTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const { data: assessmentData } = await supabase
      .from('prakriti_assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('assessed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (assessmentData) {
      setAssessment(assessmentData);

      const primaryDosha = assessmentData.dominant_dosha.split('-')[0];

      const { data: scheduleData } = await supabase
        .from('daily_schedule_templates')
        .select('*')
        .eq('dosha_type', primaryDosha)
        .order('display_order');

      if (scheduleData) {
        setScheduleTemplates(scheduleData);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading daily schedule...</div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-800">
            Please complete your Prakriti assessment first to view your personalized daily schedule.
          </p>
        </div>
      </div>
    );
  }

  const getTimeIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning':
        return <Sunrise className="w-6 h-6" />;
      case 'afternoon':
        return <Sun className="w-6 h-6" />;
      case 'evening':
        return <Sunset className="w-6 h-6" />;
      case 'night':
        return <Moon className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  const getTimeColor = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning':
        return { bg: 'bg-warm-50', text: 'text-warm-800', border: 'border-warm-200' };
      case 'afternoon':
        return { bg: 'bg-warm-50', text: 'text-warm-800', border: 'border-warm-200' };
      case 'evening':
        return { bg: 'bg-primary-50', text: 'text-primary-800', border: 'border-primary-200' };
      case 'night':
        return { bg: 'bg-secondary-50', text: 'text-secondary-800', border: 'border-secondary-200' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const doshaColors: Record<string, { bg: string; text: string; border: string }> = {
    Vata: { bg: 'bg-primary-50', text: 'text-primary-800', border: 'border-primary-200' },
    Pitta: { bg: 'bg-warm-50', text: 'text-warm-800', border: 'border-warm-200' },
    Kapha: { bg: 'bg-accent-50', text: 'text-accent-800', border: 'border-accent-200' },
  };

  const primaryDosha = assessment.dominant_dosha.split('-')[0] as 'Vata' | 'Pitta' | 'Kapha';
  const doshaColor = doshaColors[primaryDosha] || doshaColors.Vata;

  const groupedSchedule = scheduleTemplates.reduce((acc, template) => {
    if (!acc[template.time_of_day]) {
      acc[template.time_of_day] = [];
    }
    acc[template.time_of_day].push(template);
    return acc;
  }, {} as Record<string, DailyScheduleTemplate[]>);

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`${doshaColor.bg} border ${doshaColor.border} rounded-xl p-6 mb-6`}>
        <div className="flex items-center gap-3 mb-2">
          <Calendar className={`w-8 h-8 ${doshaColor.text}`} />
          <h2 className="text-2xl font-bold text-gray-900">Your Daily Routine</h2>
        </div>
        <p className={`${doshaColor.text} font-medium`}>
          Personalized schedule for {assessment.dominant_dosha} constitution
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedSchedule).map(([timeOfDay, activities]) => {
          const colors = getTimeColor(timeOfDay);
          return (
            <div key={timeOfDay} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className={`${colors.bg} border-b ${colors.border} px-6 py-4`}>
                <div className="flex items-center gap-3">
                  <div className={colors.text}>{getTimeIcon(timeOfDay)}</div>
                  <h3 className={`text-xl font-bold capitalize ${colors.text}`}>
                    {timeOfDay}
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {activity.activity}
                      </h4>
                      {activity.duration_minutes && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{activity.duration_minutes} min</span>
                        </div>
                      )}
                    </div>

                    {activity.description && (
                      <p className="text-gray-700 mb-2">{activity.description}</p>
                    )}

                    {activity.benefits && (
                      <div className="bg-green-50 rounded-lg p-3 mt-3">
                        <p className="text-sm text-green-800">
                          <span className="font-semibold">Benefits:</span> {activity.benefits}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-gradient-to-r from-accent-50 to-primary-50 border border-accent-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-accent-100 p-2 rounded-lg">
            <Lightbulb className="w-5 h-5 text-accent-600" />
          </div>
          <h3 className="font-semibold text-accent-900">Tips for Success</h3>
        </div>
        <ul className="space-y-3 text-accent-800 text-sm pl-10">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2"></div>
            <span>Consistency is key - try to maintain regular timing each day</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2"></div>
            <span>Start with one or two activities and gradually build your routine</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2"></div>
            <span>Adjust based on seasons and your personal schedule</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2"></div>
            <span>Listen to your body and modify as needed</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2"></div>
            <span>Set reminders to help establish new habits</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
