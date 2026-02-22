import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Probe } from '@/types/monitor.types';
import { format } from 'date-fns';

interface ProbeGraphProps {
  data: Probe[];
}

export function ProbeGraph({ data }: ProbeGraphProps) {
  const chartData = useMemo(() => {
    return data.map((d) => {
      // If the timestamp doesn't contain 'Z' or a timezone offset, append 'Z' to treat it as UTC
      const dateStr = d.timestamp.includes('T') || d.timestamp.endsWith('Z') 
        ? d.timestamp 
        : `${d.timestamp.replace(' ', 'T')}Z`;
      
      return {
        ...d,
        formattedTime: format(new Date(dateStr), 'HH:mm:ss'),
      };
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-none bg-neutral-50/50 dark:bg-[#111]">
        <p className="text-neutral-500 text-sm">Waiting for probe data...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-neutral-800 p-6 rounded-none animate-in fade-in zoom-in duration-500">
      <div className="mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Response Timing (ms)</h3>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">Real-time feedback from global probes</p>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTTFB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTLS" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTCP" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
          
          <XAxis 
            dataKey="formattedTime" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#888' }}
            minTickGap={30}
          />
          
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#888' }}
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              border: 'none', 
              borderRadius: '4px',
              fontSize: '12px',
              color: '#fff'
            }}
            itemStyle={{ padding: '2px 0' }}
            cursor={{ stroke: '#888', strokeWidth: 1 }}
          />
          
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}
          />

          <Area
            type="monotone"
            dataKey="dns"
            name="DNS Resolving"
            stroke="#94a3b8"
            fill="transparent"
            strokeWidth={2}
          />
          
          <Area
            type="monotone"
            dataKey="tcp"
            name="TCP Handshake"
            stroke="#f59e0b"
            fillOpacity={1}
            fill="url(#colorTCP)"
            strokeWidth={2}
          />
          
          <Area
            type="monotone"
            dataKey="tls"
            name="TLS Negotiation"
            stroke="#6366f1"
            fillOpacity={1}
            fill="url(#colorTLS)"
            strokeWidth={2}
          />
          
          <Area
            type="monotone"
            dataKey="ttfb"
            name="TTFB / Total"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorTTFB)"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
