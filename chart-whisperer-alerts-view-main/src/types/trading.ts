// Trading types - FASE 1
export interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
  change24h: number;
  volume: number;
}

export interface BinanceWSMessage {
  e: string; // event type
  E: number; // event time
  s: string; // symbol
  c: string; // close price
  o: string; // open price
  h: string; // high price
  l: string; // low price
  v: string; // volume
  q: string; // quote volume
  P: string; // price change percent
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
