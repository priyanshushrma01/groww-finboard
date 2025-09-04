import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Widget } from '../../types';

interface WidgetsState {
  widgets: Widget[];
}

const initialState: WidgetsState = {
  widgets: [
    {
      id: '1',
      type: 'stock-table',
      title: 'Market Overview',
      config: {
        symbols: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'],
        refreshInterval: 30000,
      },
      size: { width: 'full', height: 'medium' },
    },
    {
      id: '2',
      type: 'finance-cards',
      title: 'Market Movers',
      config: {
        type: 'gainers',
        count: 5,
      },
      size: { width: 'half', height: 'medium' },
    },
    {
      id: '3',
      type: 'chart',
      title: 'AAPL Price Chart',
      config: {
        symbol: 'AAPL',
        period: '1D',
        chartType: 'line',
      },
      size: { width: 'half', height: 'medium' },
    },
  ],
};

const widgetsSlice = createSlice({
  name: 'widgets',
  initialState,
  reducers: {
    addWidget: (state, action: PayloadAction<Widget>) => {
      state.widgets.push(action.payload);
    },
    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter(widget => widget.id !== action.payload);
    },
    updateWidget: (state, action: PayloadAction<{ id: string; updates: Partial<Widget> }>) => {
      const index = state.widgets.findIndex(widget => widget.id === action.payload.id);
      if (index !== -1) {
        state.widgets[index] = { ...state.widgets[index], ...action.payload.updates };
      }
    },
    reorderWidgets: (state, action: PayloadAction<Widget[]>) => {
      state.widgets = action.payload;
    },
    updateWidgetData: (state, action: PayloadAction<{ id: string; data: any }>) => {
      const widget = state.widgets.find(w => w.id === action.payload.id);
      if (widget) {
        widget.data = action.payload.data;
        widget.lastUpdated = Date.now();
        widget.loading = false;
        widget.error = null;
      }
    },
    setWidgetLoading: (state, action: PayloadAction<{ id: string; loading: boolean }>) => {
      const widget = state.widgets.find(w => w.id === action.payload.id);
      if (widget) {
        widget.loading = action.payload.loading;
      }
    },
    setWidgetError: (state, action: PayloadAction<{ id: string; error: string }>) => {
      const widget = state.widgets.find(w => w.id === action.payload.id);
      if (widget) {
        widget.error = action.payload.error;
        widget.loading = false;
      }
    },
  },
});

export const {
  addWidget,
  removeWidget,
  updateWidget,
  reorderWidgets,
  updateWidgetData,
  setWidgetLoading,
  setWidgetError,
} = widgetsSlice.actions;

export default widgetsSlice.reducer;
