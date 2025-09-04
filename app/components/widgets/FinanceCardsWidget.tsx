'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Widget } from '../../types';
import { RootState, AppDispatch } from '../../store/store';
import { fetchMarketGainersData } from '../../store/slices/apiSlice';

interface FinanceCardsWidgetProps {
  widget: Widget;
}

export default function FinanceCardsWidget({ widget }: FinanceCardsWidgetProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { gainers, loading, errors, lastUpdated } = useSelector((state: RootState) => state.api);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const fetchData = () => {
      dispatch(fetchMarketGainersData() as any);
    };

    fetchData(); // Initial fetch
    
    const interval = setInterval(fetchData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [dispatch]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdated.gainers) return '';
    const seconds = Math.floor((Date.now() - lastUpdated.gainers) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  const handleRefresh = () => {
    dispatch(fetchMarketGainersData() as any);
  };

  if (loading.gainers && gainers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading market data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Market Gainers
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getTimeSinceUpdate()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={loading.gainers}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading.gainers ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {errors.gainers && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          <div className="text-red-800 dark:text-red-200 text-sm">
            ⚠️ {errors.gainers}
          </div>
        </div>
      )}

      {/* Market gainers cards */}
      <div className="space-y-3">
        {gainers.slice(0, 5).map((stock, index) => (
          <div
            key={stock.symbol}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full text-sm font-bold">
                {index + 1}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {stock.symbol}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-32">
                  {stock.name}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-medium text-gray-900 dark:text-white">
                {formatPrice(stock.price)}
              </div>
              <div className={`text-sm flex items-center justify-end ${
                stock.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stock.change >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {gainers.length === 0 && !loading.gainers && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No market data available
        </div>
      )}
    </div>
  );
}
