'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Settings, X, GripVertical } from 'lucide-react';
import { Widget } from '../types';
import { removeWidget, updateWidget } from '../store/slices/widgetsSlice';

interface WidgetContainerProps {
  widget: Widget;
  dragHandleProps: any;
  children: React.ReactNode;
}

export default function WidgetContainer({
  widget,
  dragHandleProps,
  children,
}: WidgetContainerProps) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(widget.title);

  const handleRemove = () => {
    if (confirm('Are you sure you want to remove this widget?')) {
      dispatch(removeWidget(widget.id));
    }
  };

  const handleTitleSave = () => {
    dispatch(updateWidget({ id: widget.id, updates: { title } }));
    setIsEditing(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitle(widget.title);
      setIsEditing(false);
    }
  };

  return (
    <div className="widget-card animate-fade-in">
      <div className="widget-header">
        <div className="flex items-center space-x-2 flex-1">
          <div {...dragHandleProps} className="drag-handle">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyPress}
              className="flex-1 px-2 py-1 text-sm font-medium bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          ) : (
            <h3
              onClick={() => setIsEditing(true)}
              className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 flex-1"
            >
              {widget.title}
            </h3>
          )}
          
          {widget.loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {/* Future: Open settings modal */}}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Widget Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Remove Widget"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="widget-content">
        {widget.error ? (
          <div className="text-center py-8">
            <div className="text-red-500 text-sm mb-2">⚠️ Error</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{widget.error}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
