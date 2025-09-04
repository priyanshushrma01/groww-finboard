const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface ChartData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Fetch real stock quotes with better error handling
export const fetchStockQuotes = async (symbols: string[]): Promise<StockData[]> => {
  try {
    const promises = symbols.map(async (symbol) => {
      try {
        const response = await fetch(
          `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check for API errors
        if (data['Error Message']) {
          throw new Error(`API Error: ${data['Error Message']}`);
        }
        
        if (data['Note']) {
          throw new Error('API rate limit reached');
        }
        
        const quote = data['Global Quote'];
        
        // Check if quote exists and has required fields
        if (!quote || !quote['01. symbol']) {
          throw new Error(`No quote data for symbol: ${symbol}`);
        }
        
        return {
          symbol: quote['01. symbol'] || symbol,
          name: getCompanyName(symbol),
          price: parseFloat(quote['05. price']) || 0,
          change: parseFloat(quote['09. change']) || 0,
          changePercent: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
          volume: parseInt(quote['06. volume']) || 0,
        };
      } catch (error) {
        console.warn(`Error fetching data for ${symbol}:`, error);
        // Return fallback data for this symbol
        return getSampleStockData([symbol])[0] || {
          symbol,
          name: getCompanyName(symbol),
          price: 0,
          change: 0,
          changePercent: 0,
          volume: 0,
        };
      }
    });
    
    const results = await Promise.all(promises);
    return results.filter(stock => stock !== null);
    
  } catch (error) {
    console.error('Error fetching stock quotes:', error);
    // Return sample data as complete fallback
    return getSampleStockData(symbols);
  }
};

// Fetch chart data with better error handling
export const fetchChartData = async (symbol: string): Promise<ChartData[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for API errors
    if (data['Error Message']) {
      throw new Error(`API Error: ${data['Error Message']}`);
    }
    
    if (data['Note']) {
      throw new Error('API rate limit reached');
    }
    
    const timeSeries = data['Time Series (Daily)'];
    
    // Check if time series data exists
    if (!timeSeries || typeof timeSeries !== 'object') {
      throw new Error('No time series data available');
    }
    
    const chartData: ChartData[] = [];
    const dates = Object.keys(timeSeries).slice(0, 30);
    
    dates.forEach(date => {
      const dayData = timeSeries[date];
      if (dayData) {
        chartData.push({
          date,
          open: parseFloat(dayData['1. open']) || 0,
          high: parseFloat(dayData['2. high']) || 0,
          low: parseFloat(dayData['3. low']) || 0,
          close: parseFloat(dayData['4. close']) || 0,
          volume: parseInt(dayData['5. volume']) || 0,
        });
      }
    });
    
    return chartData.reverse(); // Most recent first
  } catch (error) {
    console.warn('Error fetching chart data:', error);
    return getSampleChartData();
  }
};

// Fetch market gainers with better error handling
export const fetchMarketGainers = async (): Promise<StockData[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for API errors
    if (data['Error Message']) {
      throw new Error(`API Error: ${data['Error Message']}`);
    }
    
    if (data['Note']) {
      throw new Error('API rate limit reached');
    }
    
    const gainers = data.top_gainers;
    
    if (!gainers || !Array.isArray(gainers)) {
      throw new Error('No gainers data available');
    }
    
    return gainers.slice(0, 5).map((item: any) => ({
      symbol: item.ticker || 'N/A',
      name: getCompanyName(item.ticker || 'N/A'),
      price: parseFloat(item.price) || 0,
      change: parseFloat(item.change_amount) || 0,
      changePercent: parseFloat(item.change_percentage?.replace('%', '')) || 0,
      volume: 0,
    }));
  } catch (error) {
    console.warn('Error fetching market gainers:', error);
    return getSampleGainers();
  }
};

// Helper functions
const getCompanyName = (symbol: string): string => {
  const companies: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corp.',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'NVDA': 'NVIDIA Corp.',
    'META': 'Meta Platforms Inc.',
  };
  return companies[symbol] || symbol;
};

// Fallback sample data
const getSampleStockData = (symbols: string[]): StockData[] => {
  const allSampleData = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.84, change: 2.41, changePercent: 1.39, volume: 50127900 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 138.32, change: 0.87, changePercent: 0.63, volume: 25384700 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 338.11, change: -1.23, changePercent: -0.36, volume: 22929400 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145.86, change: -0.94, changePercent: -0.64, volume: 31827500 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: 4.12, changePercent: 1.69, volume: 45692800 },
  ];
  
  return allSampleData.filter(stock => symbols.includes(stock.symbol));
};

const getSampleGainers = (): StockData[] => [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 465.23, change: 23.45, changePercent: 5.31, volume: 38945600 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 142.67, change: 8.91, changePercent: 6.67, volume: 25384700 },
  { symbol: 'PLTR', name: 'Palantir Technologies', price: 28.45, change: 1.67, changePercent: 6.24, volume: 15384700 },
];

const getSampleChartData = (): ChartData[] => [
  { date: '2024-08-26', open: 170.00, high: 172.50, low: 169.80, close: 171.25, volume: 48567800 },
  { date: '2024-08-27', open: 171.30, high: 173.90, low: 170.45, close: 172.87, volume: 52341900 },
  { date: '2024-08-28', open: 172.90, high: 176.25, low: 171.80, close: 175.84, volume: 50127900 },
  { date: '2024-08-29', open: 175.90, high: 177.45, low: 174.30, close: 176.12, volume: 48934200 },
  { date: '2024-08-30', open: 176.00, high: 178.90, low: 175.50, close: 178.45, volume: 52341600 },
];
