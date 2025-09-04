import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchStockQuotes, fetchMarketGainers, fetchChartData, StockData, ChartData } from '../../services/apiService';

// Async thunks for real API calls
export const fetchStockData = createAsyncThunk(
  'api/fetchStockData',
  async (symbols: string[]) => {
    return await fetchStockQuotes(symbols);
  }
);

export const fetchMarketGainersData = createAsyncThunk(
  'api/fetchMarketGainers',
  async () => {
    return await fetchMarketGainers();
  }
);

export const fetchChartDataAsync = createAsyncThunk(
  'api/fetchChartData',
  async (symbol: string) => {
    return await fetchChartData(symbol);
  }
);

interface ApiState {
  stockData: StockData[];
  gainers: StockData[];
  chartData: Record<string, ChartData[]>;
  loading: {
    stockData: boolean;
    gainers: boolean;
    chartData: boolean;
  };
  errors: {
    stockData: string | null;
    gainers: string | null;
    chartData: string | null;
  };
  lastUpdated: {
    stockData: number | null;
    gainers: number | null;
    chartData: number | null;
  };
}

const initialState: ApiState = {
  stockData: [],
  gainers: [],
  chartData: {},
  loading: {
    stockData: false,
    gainers: false,
    chartData: false,
  },
  errors: {
    stockData: null,
    gainers: null,
    chartData: null,
  },
  lastUpdated: {
    stockData: null,
    gainers: null,
    chartData: null,
  },
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    clearCache: (state) => {
      state.stockData = [];
      state.gainers = [];
      state.chartData = {};
    },
    clearErrors: (state) => {
      state.errors.stockData = null;
      state.errors.gainers = null;
      state.errors.chartData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Stock data
      .addCase(fetchStockData.pending, (state) => {
        state.loading.stockData = true;
        state.errors.stockData = null;
      })
      .addCase(fetchStockData.fulfilled, (state, action) => {
        state.loading.stockData = false;
        state.stockData = action.payload;
        state.lastUpdated.stockData = Date.now();
      })
      .addCase(fetchStockData.rejected, (state, action) => {
        state.loading.stockData = false;
        state.errors.stockData = action.error.message || 'Failed to fetch stock data';
      })
      
      // Market gainers
      .addCase(fetchMarketGainersData.pending, (state) => {
        state.loading.gainers = true;
        state.errors.gainers = null;
      })
      .addCase(fetchMarketGainersData.fulfilled, (state, action) => {
        state.loading.gainers = false;
        state.gainers = action.payload;
        state.lastUpdated.gainers = Date.now();
      })
      .addCase(fetchMarketGainersData.rejected, (state, action) => {
        state.loading.gainers = false;
        state.errors.gainers = action.error.message || 'Failed to fetch market gainers';
      })
      
      // Chart data
      .addCase(fetchChartDataAsync.pending, (state) => {
        state.loading.chartData = true;
        state.errors.chartData = null;
      })
      .addCase(fetchChartDataAsync.fulfilled, (state, action) => {
        state.loading.chartData = false;
        const symbol = action.meta.arg;
        state.chartData[symbol] = action.payload;
        state.lastUpdated.chartData = Date.now();
      })
      .addCase(fetchChartDataAsync.rejected, (state, action) => {
        state.loading.chartData = false;
        state.errors.chartData = action.error.message || 'Failed to fetch chart data';
      });
  },
});

export const { clearCache, clearErrors } = apiSlice.actions;
export default apiSlice.reducer;
