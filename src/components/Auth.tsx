import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart, User, Mail, Lock, AlertCircle } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setError('Full name is required');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-center">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full inline-block mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Prakriti Wellness Analyzer</h1>
          <p className="text-white/90 mt-2">
            Personalized wellness through ancient wisdom
          </p>
        </div>

        <div className="p-8">
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isSignUp
                  ? 'bg-white shadow text-primary-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isSignUp
                  ? 'bg-white shadow text-primary-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-lg font-medium hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Please wait...
                </>
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
