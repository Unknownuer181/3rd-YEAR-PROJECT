import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface NetworkChartProps {
  data: { time: string; allowed: number; blocked: number }[];
}

const NetworkChart: React.FC<NetworkChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorAllowed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff0055" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ff0055" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0a1120', borderColor: '#1e293b', color: '#e2e8f0' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Area
            type="monotone"
            dataKey="allowed"
            stroke="#00f3ff"
            fillOpacity={1}
            fill="url(#colorAllowed)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="blocked"
            stroke="#ff0055"
            fillOpacity={1}
            fill="url(#colorBlocked)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NetworkChart;
