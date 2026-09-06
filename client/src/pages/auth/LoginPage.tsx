import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Sprout, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);

      const userRole = response.data.user.role;
      if (userRole === 'FARMER') {
        navigate('/farmer/dashboard');
      } else if (userRole === 'BUYER') {
        navigate('/buyer/dashboard');
      } else if (userRole === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || (err.message === 'Network Error' ? 'Unable to connect to backend server. Please make sure the service is online.' : err.message) || 'Login failed. Please check credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-agri-600 font-black text-2xl">
            <Sprout className="w-7 h-7 text-agri-600" /> AGRI<span className="text-gray-900">LINK</span>
          </Link>
          <h2 className="text-2xl font-black text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-500">Sign in to manage listings, offers, and buyer connections</p>
        </div>

        <Card className="shadow-lg border-gray-200">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh@farmer.com"
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full bg-agri-600 hover:bg-agri-700" isLoading={loading}>
                Sign In <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Quick Demo Logins */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mb-2">Quick Demo Accounts</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDemoCredentials('ramesh@farmer.com')}
                  className="px-2 py-2 bg-agri-50 hover:bg-agri-100 border border-agri-200 text-agri-800 text-xs font-bold rounded-xl transition"
                >
                  👨‍🌾 Farmer
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('fresh@foods.com')}
                  className="px-2 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold rounded-xl transition"
                >
                  🏪 Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('admin@agrilink.com')}
                  className="px-2 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold rounded-xl transition"
                >
                  👨‍💼 Admin
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-agri-600 hover:text-agri-700">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
