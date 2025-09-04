'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, BarChart3, Table, TrendingUp } from 'lucide-react';
import { addWidget } from '../../store/slices/widgetsSlice';
import { Widget } from '../../types';

interface AddWidgetModalProps {
  onClose: () => void;
}

const WIDGET_TYPES = [
  {
    type: 'stock-table' as const,
    name: 'Stock Table',
    description: 'Display stock prices in a searchable, paginated table',
    icon: Table,
    defaultConfig: {
      symbols: ['AAPL', 'GOOGL', 'MSFT'],
      refreshInterval: 30000,
    },
    size: { width: 'full' as const, height: 'medium' as const },
  },
  {
    type: 'finance-cards' as const,
    name: 'Finance Cards',
    description: 'Show market movers and performance data in card format',
    icon: TrendingUp,
    defaultConfig: {
      type: 'gainers',
      count: 5,
    },
    size: { width: 'half' as const, height: 'medium' as const },
  },
  {
    type: 'chart' as const,
    name: 'Price Chart',
    description: 'Interactive charts with technical indicators',
    icon: BarChart3,
    defaultConfig: {
      symbol: 'AAPL',
      period: '1D',
      chartType: 'line',
    },
    size: { width: 'half' as const, height: 'medium' as const },
  },
];

export default function AddWidgetModal({ onClose }: AddWidgetModalProps) {
  const dispatch = useDispatch();
  const [selectedType, setSelectedType] = useState<(typeof WIDGET_TYPES)[0] | null>(null);
  const [title, setTitle] = useState('');

  const handleAddWidget = () => {
    if (!selectedType || !title.trim()) return;

    const newWidget: Widget = {
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: selectedType.type,
      title: title.trim(),
      config: selectedType.defaultConfig,
      size: selectedType.size,
    };

    dispatch(addWidget(newWidget));
    onClose();
  };

  const handleTypeSelect = (widgetType: typeof WIDGET_TYPES[0]) => {
    setSelectedType(widgetType);
    setTitle(widgetType.name);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Widget
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!selectedType ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Choose Widget Type
              </h3>
              <div className="grid gap-4">
                {WIDGET_TYPES.map((widgetType) => (
                  <button
                    key={widgetType.type}
                    onClick={() => handleTypeSelect(widgetType)}
                    className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
                  >
                    <widgetType.icon className="w-8 h-8 text-blue-600 mr-4" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {widgetType.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {widgetType.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Widget Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter widget title"
                  autoFocus
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setSelectedType(null);
                    setTitle('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleAddWidget}
                  disabled={!title.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors"
                >
                  Add Widget
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
