import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, DietRecommendation, PrakritiAssessment } from '../lib/supabase';
import { Utensils, Clock, CheckCircle, XCircle } from 'lucide-react';

export const DietChart: React.FC = () => {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<PrakritiAssessment | null>(null);
  const [recommendations, setRecommendations] = useState<DietRecommendation[]>([]);
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

      const { data: dietData } = await supabase
        .from('diet_recommendations')
        .select('*')
        .eq('dosha_type', primaryDosha)
        .order('meal_type');

      if (dietData) {
        setRecommendations(dietData);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading diet recommendations...</div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-800">
            Please complete your Prakriti assessment first to view personalized diet recommendations.
          </p>
        </div>
      </div>
    );
  }

  const doshaColors: Record<string, { bg: string; text: string; border: string }> = {
    Vata: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    Pitta: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
    Kapha: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
  };

  const primaryDosha = assessment.dominant_dosha.split('-')[0] as 'Vata' | 'Pitta' | 'Kapha';
  const colors = doshaColors[primaryDosha] || doshaColors.Vata;

  const mealOrder = ['breakfast', 'snack', 'lunch', 'dinner'];
  const sortedRecommendations = [...recommendations].sort(
    (a, b) => mealOrder.indexOf(a.meal_type) - mealOrder.indexOf(b.meal_type)
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className={`${colors.bg} border ${colors.border} rounded-xl p-6 mb-6`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Personalized Diet Chart
        </h2>
        <p className={`${colors.text} font-medium`}>
          Based on your {assessment.dominant_dosha} constitution
        </p>
        <div className="mt-4 flex gap-6 text-sm">
          <div>
            <span className="text-gray-600">Vata Score:</span>
            <span className="ml-2 font-semibold">{assessment.vata_score}</span>
          </div>
          <div>
            <span className="text-gray-600">Pitta Score:</span>
            <span className="ml-2 font-semibold">{assessment.pitta_score}</span>
          </div>
          <div>
            <span className="text-gray-600">Kapha Score:</span>
            <span className="ml-2 font-semibold">{assessment.kapha_score}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {sortedRecommendations.map((rec) => (
          <div key={rec.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`${colors.bg} p-3 rounded-lg`}>
                <Utensils className={`w-6 h-6 ${colors.text}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 capitalize">
                  {rec.meal_type}
                </h3>
                {rec.timing && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{rec.timing}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Recommended Foods</h4>
                </div>
                <ul className="space-y-2">
                  {rec.food_items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-gray-900">Foods to Avoid</h4>
                </div>
                <ul className="space-y-2">
                  {rec.foods_to_avoid.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-red-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {rec.portion_guidelines && (
              <div className={`mt-4 ${colors.bg} rounded-lg p-4`}>
                <p className={`text-sm font-medium ${colors.text}`}>
                  <span className="font-bold">Portion Guidelines:</span> {rec.portion_guidelines}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">General Guidelines</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>• Eat mindfully and in a calm environment</li>
          <li>• Drink warm water throughout the day</li>
          <li>• Make lunch your largest meal of the day</li>
          <li>• Avoid eating late at night</li>
          <li>• Listen to your body and adjust portions as needed</li>
        </ul>
      </div>
    </div>
  );
};
