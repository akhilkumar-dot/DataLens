import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100 backdrop-blur-sm">
      <p className="text-xs font-bold text-slate-800 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-500 font-medium">{entry.name}:</span>
          <span className="text-slate-900 font-bold">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function DataChart({ chartData }) {
  if (!chartData || !chartData.data || chartData.data.length === 0) return null;

  const { labels, numericColumns, data } = chartData;
  const useLineChart = data.length > 15;
  const ChartComponent = useLineChart ? LineChart : BarChart;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
          Data Visualization
        </h3>
        <span className="ml-auto text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          {useLineChart ? 'Line' : 'Bar'} Chart
        </span>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey={labels || undefined}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8f9fc' }} />
            <Legend
              wrapperStyle={{ fontSize: '11px', color: '#475569', fontWeight: 500, paddingTop: '10px' }}
              iconType="circle"
              iconSize={8}
            />
            {numericColumns.map((col, i) =>
              useLineChart ? (
                <Line
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: COLORS[i % COLORS.length] }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              ) : (
                <Bar
                  key={col}
                  dataKey={col}
                  fill={COLORS[i % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                  opacity={0.9}
                />
              )
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
