import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, PrakritiQuestion } from '../lib/supabase';
import { CheckCircle, Circle, ArrowLeft, ArrowRight } from 'lucide-react';

export const PrakritiAssessment: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<PrakritiQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from('prakriti_questions')
      .select('*')
      .order('display_order');

    if (data && !error) {
      setQuestions(data);
    }
    setLoading(false);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const calculateResults = () => {
    let vataScore = 0;
    let pittaScore = 0;
    let kaphaScore = 0;

    Object.values(answers).forEach((answer) => {
      if (answer === 'vata') vataScore++;
      else if (answer === 'pitta') pittaScore++;
      else if (answer === 'kapha') kaphaScore++;
    });

    let dominantDosha = 'Vata';
    const maxScore = Math.max(vataScore, pittaScore, kaphaScore);

    if (pittaScore === maxScore) dominantDosha = 'Pitta';
    else if (kaphaScore === maxScore) dominantDosha = 'Kapha';

    if (vataScore === pittaScore && vataScore > kaphaScore) dominantDosha = 'Vata-Pitta';
    else if (vataScore === kaphaScore && vataScore > pittaScore) dominantDosha = 'Vata-Kapha';
    else if (pittaScore === kaphaScore && pittaScore > vataScore) dominantDosha = 'Pitta-Kapha';
    else if (vataScore === pittaScore && pittaScore === kaphaScore) dominantDosha = 'Tri-Dosha';

    return { vataScore, pittaScore, kaphaScore, dominantDosha };
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions');
      return;
    }

    setSubmitting(true);
    const results = calculateResults();

    const { error } = await supabase.from('prakriti_assessments').insert([
      {
        user_id: user?.id,
        vata_score: results.vataScore,
        pitta_score: results.pittaScore,
        kapha_score: results.kaphaScore,
        dominant_dosha: results.dominantDosha,
        assessment_data: answers,
      },
    ]);

    setSubmitting(false);

    if (!error) {
      onComplete();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading assessment...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (Object.keys(answers).length / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Prakriti Assessment</h2>
          <p className="text-white/90">
            Discover your unique Ayurvedic constitution
          </p>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-primary-700">
                {Object.keys(answers).length} of {questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {currentQuestion && (
            <div className="mb-10">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-700 bg-primary-100 rounded-full">
                    {currentQuestion.category}
                  </span>
                  <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentQuestion.question}
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  { type: 'vata', text: currentQuestion.vata_option, color: 'bg-blue-50 border-blue-200', selected: 'bg-blue-50 border-blue-500' },
                  { type: 'pitta', text: currentQuestion.pitta_option, color: 'bg-orange-50 border-orange-200', selected: 'bg-orange-50 border-orange-500' },
                  { type: 'kapha', text: currentQuestion.kapha_option, color: 'bg-green-50 border-green-200', selected: 'bg-green-50 border-green-500' },
                ].map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleAnswer(currentQuestion.id, option.type)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                      answers[currentQuestion.id] === option.type
                        ? option.selected + ' shadow-md'
                        : option.color + ' hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        answers[currentQuestion.id] === option.type
                          ? 'bg-white border-2 border-blue-500'
                          : 'bg-gray-100 border-2 border-gray-300'
                      }`}>
                        {answers[currentQuestion.id] === option.type && (
                          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 capitalize">{option.type}</span>
                        <p className="text-gray-700 mt-1">{option.text}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() =>
                  setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))
                }
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-medium hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length < questions.length}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-medium hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Assessment
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-primary-600 w-8'
                    : answers[questions[index]?.id]
                    ? 'bg-primary-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
