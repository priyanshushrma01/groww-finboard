'use client';

import { useSelector } from 'react-redux';
import { Plus, Download, Upload } from 'lucide-react';
import { RootState } from '../store/store';

interface HeaderProps {
  onAddWidget: () => void;
}

export default function Header({ onAddWidget }: HeaderProps) {
  const widgets = useSelector((state: RootState) => state.widgets.widgets);

  const handleExport = () => {
    const config = {
      widgets,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finboard-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        console.log('Imported configuration:', config);
      } catch (error) {
        console.error('Invalid configuration file:', error);
        alert('Invalid configuration file');
      }
    };
    reader.readAsText(file);
    
    event.target.value = '';
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white">
                FinBoard
              </h1>
              <p className="text-sm text-gray-400">
                Groww Assignment - Customizable Finance Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onAddWidget}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Widget
            </button>

            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>

            <label className="inline-flex items-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      </div>
    </header>
  );
}
