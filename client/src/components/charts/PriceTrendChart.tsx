import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface PricePoint {
  date: string;
  averagePrice: number;
  marketName?: string;
}

interface PriceTrendChartProps {
  data: PricePoint[];
  cropName: string;
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({ data, cropName }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 text-gray-400 text-sm">
        No price history data available for this selection
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    price: d.averagePrice,
    market: d.marketName || 'Mandi Price',
  }));

  const minPrice = Math.floor(Math.min(...data.map((d) => d.averagePrice)) * 0.9);
  const maxPrice = Math.ceil(Math.max(...data.map((d) => d.averagePrice)) * 1.1);

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} domain={[minPrice, maxPrice]} tickLine={false} tickFormatter={(v) => `₹${v}`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
            formatter={(value: any) => [`₹${value}/kg`, `${cropName} Avg Price`]}
          />
          <Legend />
          <Area type="monotone" dataKey="price" name={`${cropName} Price (₹/kg)`} stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
