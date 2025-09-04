'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { Widget } from '../../types';
import { RootState, AppDispatch } from '../../store/store';
import { fetchChartDataAsync } from '../../store/slices/apiSlice';

interface ChartWidgetProps {
  widget: Widget;
}

export default function ChartWidget({ widget }: ChartWidgetProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { chartData, loading, errors, lastUpdated } = useSelector((state: RootState) => state.api);
  
  const symbol = widget.config.symbol || 'AAPL';
  const data = chartData[symbol] || [];

  // Auto-refresh every 60 seconds for chart data
  useEffect(() => {
    const fetchData = () => {
      dispatch(fetchChartDataAsync(symbol) as any);
    };

    fetchData(); // Initial fetch
    
    const interval = setInterval(fetchData, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, [dispatch, symbol]);

  const formatData = (data: any[]) => {
    return data.slice(-30).map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: item.close,
    }));
  };

  const currentPrice = data[data.length - 1]?.close || 0;
  const previousPrice = data[data.length - 2]?.close || 0;
  const change = currentPrice - previousPrice;
  const changePercent = previousPrice ? ((change / previousPrice) * 100) : 0;

  const getTimeSinceUpdate = () => {
    if (!lastUpdated.chartData) return '';
    const seconds = Math.floor((Date.now() - lastUpdated.chartData) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  const handleRefresh = () => {
    dispatch(fetchChartDataAsync(symbol) as any);
  };

  if (loading.chartData && data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading chart data...</span>
      </div>
    );
  }

  const formattedData = formatData(data);

  return (
    <div className="space-y-4">
      {/* Chart header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${currentPrice.toFixed(2)}
          </div>
          <div className={`text-sm flex items-center ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {symbol} • {widget.config.period || '30D'}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getTimeSinceUpdate()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={loading.chartData}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading.chartData ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {errors.chartData && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          <div className="text-red-800 dark:text-red-200 text-sm">
            ⚠️ {errors.chartData}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
              formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={change >= 0 ? '#22C55E' : '#EF4444'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: change >= 0 ? '#22C55E' : '#EF4444' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Volume chart */}
      {formattedData.length > 0 && (
        <div className="h-20 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
                formatter={(value: any) => [
                  new Intl.NumberFormat().format(value), 
                  'Volume'
                ]}
              />
              <Bar 
                dataKey="volume" 
                fill="#6B7280" 
                opacity={0.6}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {formattedData.length === 0 && !loading.chartData && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No chart data available for {symbol}
        </div>
      )}
    </div>
  );
}
