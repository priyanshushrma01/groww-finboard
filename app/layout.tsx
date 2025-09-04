'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Provider } from 'react-redux';
import { store } from './store/store';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>FinBoard - Groww Assignment</title>
        <meta name="description" content="Customizable Finance Dashboard for Groww Web Intern Assignment" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <Provider store={store}>
          {children}
        </Provider>
      </body>
    </html>
  );
}
