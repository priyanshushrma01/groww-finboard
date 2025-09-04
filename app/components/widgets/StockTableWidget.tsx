'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Widget } from '../../types';
import { RootState, AppDispatch } from '../../store/store';
import { fetchStockData } from '../../store/slices/apiSlice';

interface StockTableWidgetProps {
  widget: Widget;
}

export default function StockTableWidget({ widget }: StockTableWidgetProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { stockData, loading, errors, lastUpdated } = useSelector((state: RootState) => state.api);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const pageSize = 10;
  const symbols = widget.config.symbols || ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];

  // Initial fetch and auto-refresh every 30 seconds
  useEffect(() => {
    const fetchData = () => {
      dispatch(fetchStockData(symbols) as any);
    };

    fetchData(); // Initial fetch
    
    const interval = setInterval(fetchData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [dispatch, symbols]);

  const filteredStocks = stockData.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStocks.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const displayedStocks = filteredStocks.slice(startIndex, startIndex + pageSize);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdated.stockData) return '';
    const seconds = Math.floor((Date.now() - lastUpdated.stockData) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  const handleRefresh = () => {
    dispatch(fetchStockData(symbols) as any);
  };

  if (loading.stockData && stockData.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading stock data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search and refresh */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 mr-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getTimeSinceUpdate()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={loading.stockData}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading.stockData ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {errors.stockData && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          <div className="text-red-800 dark:text-red-200 text-sm">
            ⚠️ {errors.stockData}
          </div>
        </div>
      )}

      {/* Stock table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Price</th>
              <th>Change</th>
              <th>Change %</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {displayedStocks.map((stock) => (
              <tr key={stock.symbol}>
                <td>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {stock.symbol}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-32">
                      {stock.name}
                    </div>
                  </div>
                </td>
                <td className="font-medium text-gray-900 dark:text-white">
                  {formatPrice(stock.price)}
                </td>
                <td>
                  <div className={`flex items-center ${
                    stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stock.change >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                  </div>
                </td>
                <td>
                  <span className={`font-medium ${
                    stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                </td>
                <td className="text-gray-600 dark:text-gray-400">
                  {formatVolume(stock.volume)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredStocks.length)} of {filteredStocks.length} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {displayedStocks.length === 0 && !loading.stockData && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {searchTerm ? 'No stocks match your search' : 'No stock data available'}
        </div>
      )}
    </div>
  );
}
