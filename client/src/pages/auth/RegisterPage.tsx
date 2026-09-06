import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Sprout, ArrowRight } from 'lucide-react';
import { UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { LocationPicker } from '../../components/common/LocationPicker';
import { LocationResult } from '../../services/locationService';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRoleParam = searchParams.get('role');
  const [role, setRole] = useState<UserRole>(
    initialRoleParam === 'BUYER' ? 'BUYER' : 'FARMER'
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('Wholesaler');

  // Location State
  const [locationData, setLocationData] = useState<LocationResult | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialRoleParam === 'BUYER') setRole('BUYER');
    else if (initialRoleParam === 'FARMER') setRole('FARMER');
  }, [initialRoleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!locationData) {
      setError('Please search or detect your location before creating an account.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        phone,
        password,
        role,
        city: locationData.displayName || locationData.name,
        state: locationData.state || 'Andhra Pradesh',
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        ...(role === 'FARMER' && { farmName: farmName || `${name}'s Farm` }),
        ...(role === 'BUYER' && { companyName: companyName || `${name} Traders`, businessType }),
      };

      const response = await api.post('/auth/register', payload);
      login(response.data.token, response.data.user);

      if (role === 'FARMER') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-agri-600 font-black text-2xl">
            <Sprout className="w-7 h-7 text-agri-600" /> AGRI<span className="text-gray-900">LINK</span>
          </Link>
          <h2 className="text-2xl font-black text-gray-900">Create Your AgriLink Account</h2>
          <p className="text-sm text-gray-500">Join farmers, wholesalers, and traders in local agricultural commerce</p>
        </div>

        <Card className="shadow-lg border-gray-200">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-gray-700">What is your primary goal?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('FARMER')}
                  className={`p-3.5 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition ${
                    role === 'FARMER'
                      ? 'bg-agri-600 text-white border-agri-600 shadow-md ring-2 ring-agri-500/30'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  👨‍🌾 Sell Produce (Farmer)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('BUYER')}
                  className={`p-3.5 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition ${
                    role === 'BUYER'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md ring-2 ring-sky-500/30'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  🏪 Buy Produce (Buyer)
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9848012345"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
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
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
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
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                />
              </div>

              {/* DYNAMIC LOCATION PICKER */}
              <LocationPicker
                label="Your Actual Location (Village / Town / City / PIN)"
                placeholder="Search village, town, city or PIN code (e.g. Gollapudi)"
                onChange={(loc) => setLocationData(loc)}
              />

              {/* FARMER SPECIFIC */}
              {role === 'FARMER' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Farm / Village Name</label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Sri Venkateswara Organic Farm"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                  />
                </div>
              )}

              {/* BUYER SPECIFIC */}
              {role === 'BUYER' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Company / Shop Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Fresh Mandi Traders"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Buyer Type</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      <option value="Local Trader">Local Trader</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Retailer">Retailer</option>
                      <option value="Supermarket">Supermarket</option>
                      <option value="Processor">Processor</option>
                      <option value="Exporter">Exporter</option>
                      <option value="Restaurant / Hotel Supplier">Restaurant / Hotel Supplier</option>
                      <option value="Cooperative">Cooperative</option>
                      <option value="Institutional Buyer">Institutional Buyer</option>
                      <option value="Other Business">Other Business</option>
                    </select>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className={`w-full ${role === 'FARMER' ? 'bg-agri-600 hover:bg-agri-700' : 'bg-sky-600 hover:bg-sky-700'}`}
                isLoading={loading}
              >
                Create Account & Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-agri-600 hover:text-agri-700">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
