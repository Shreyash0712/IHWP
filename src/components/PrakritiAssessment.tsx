import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, PrakritiQuestion } from '../lib/supabase';
import { CheckCircle, Circle } from 'lucide-react';

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
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Prakriti Assessment</h2>
          <p className="text-gray-600 mb-4">
            Answer these questions to discover your unique constitution
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {Object.keys(answers).length} of {questions.length} questions answered
          </p>
        </div>

        {currentQuestion && (
          <div className="mb-8">
            <div className="mb-4">
              <span className="text-sm font-medium text-green-600 uppercase">
                {currentQuestion.category}
              </span>
              <h3 className="text-xl font-semibold text-gray-900 mt-2">
                {currentQuestion.question}
              </h3>
            </div>

            <div className="space-y-3">
              {[
                { type: 'vata', text: currentQuestion.vata_option },
                { type: 'pitta', text: currentQuestion.pitta_option },
                { type: 'kapha', text: currentQuestion.kapha_option },
              ].map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleAnswer(currentQuestion.id, option.type)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestion.id] === option.type
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {answers[currentQuestion.id] === option.type ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="text-gray-800">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={() =>
                setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))
              }
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length < questions.length}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentQuestionIndex
                  ? 'bg-green-600 w-8'
                  : answers[questions[index]?.id]
                  ? 'bg-green-300'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
