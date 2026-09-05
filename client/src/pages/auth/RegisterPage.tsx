import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Sprout } from 'lucide-react';
import { UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('FARMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Vijayawada');
  const [farmName, setFarmName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('Wholesaler');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        phone,
        password,
        role,
        city,
        state: 'Andhra Pradesh',
        ...(role === 'FARMER' && { farmName }),
        ...(role === 'BUYER' && { companyName, businessType }),
      };

      const response = await api.post('/auth/register', payload);
      login(response.data.token, response.data.user);

      if (role === 'FARMER') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-agri-600 font-black text-2xl">
            <Sprout className="w-7 h-7" /> AGRI<span className="text-gray-900">LINK</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
          <p className="text-sm text-gray-500">Join India's Agri Market Linkage Platform</p>
        </div>

        <Card className="shadow-lg border-gray-200">
          <CardContent className="p-8 space-y-6">
            {/* Role Toggle Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-gray-700">Select Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('FARMER')}
                  className={`p-3 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 transition ${
                    role === 'FARMER'
                      ? 'bg-agri-600 text-white border-agri-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  👨‍🌾 Farmer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('BUYER')}
                  className={`p-3 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 transition ${
                    role === 'BUYER'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  🏪 Buyer / Trader
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9848012345"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@gmail.com"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">City / Location</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                >
                  <option value="Vijayawada">Vijayawada</option>
                  <option value="Guntur">Guntur</option>
                  <option value="Eluru">Eluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Kolar">Kolar</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              {role === 'FARMER' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Farm Name</label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Green Valley Farm"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                  />
                </div>
              )}

              {role === 'BUYER' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Company / Shop Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Fresh Mandi Ltd"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Business Type</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                    >
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Retailer">Retailer</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Food Processor">Food Processor</option>
                      <option value="Exporter">Exporter</option>
                    </select>
                  </div>
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
                Create Account
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-agri-600 hover:text-agri-700">
                  Log in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
