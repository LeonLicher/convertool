import { createContext, useContext, ReactNode } from 'react';
import { HttpClient } from '../httpClient';

const HttpClientContext = createContext<HttpClient | undefined>(undefined);

interface HttpClientProviderProps {
  children: ReactNode;
  baseURL: string;
}

export function HttpClientProvider({ children, baseURL }: HttpClientProviderProps) {
  const httpClient = new HttpClient();
  httpClient.init(baseURL);

  return (
    <HttpClientContext.Provider value={httpClient}>
      {children}
    </HttpClientContext.Provider>
  );
}

export function useHttpClient() {
  const context = useContext(HttpClientContext);
  if (context === undefined) {
    throw new Error('useHttpClient must be used within a HttpClientProvider');
  }
  return context;
} 