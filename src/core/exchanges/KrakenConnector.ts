// 🔱 KRAKEN CONNECTOR - Conexión Real con Kraken Exchange
import axios from "axios";
import crypto from "crypto";
import qs from "querystring";
import { EventBus } from '../../circulation/channels/EventBus';

export interface KrakenBalance {
  [currency: string]: string;
}

export interface KrakenTicker {
  symbol: string;
  price: number;
  volume: number;
  high: number;
  low: number;
  timestamp: number;
}

export interface KrakenOrderBook {
  symbol: string;
  bids: [number, number][];
  asks: [number, number][];
  timestamp: number;
}

export class KrakenConnector {
  private eventBus: EventBus;
  private apiKey: string;
  private privateKey: Buffer;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(apiKey: string, privateKey: string) {
    this.eventBus = EventBus.getInstance();
    this.apiKey = apiKey;
    this.privateKey = Buffer.from(privateKey, "base64");
  }

  async initialize(): Promise<void> {
    console.log('🔱 KrakenConnector: Inicializando conexión con Kraken...');
    
    try {
      await this.testConnection();
      this.isConnected = true;
      this.startDataStreams();
      
      console.log('✅ KrakenConnector: Conectado exitosamente a Kraken');
      this.eventBus.emit('exchange.kraken.connected', { exchange: 'kraken', status: 'connected' });
    } catch (error) {
      console.error('❌ KrakenConnector: Error conectando a Kraken:', error);
      this.scheduleReconnect();
    }
  }

  private async testConnection(): Promise<void> {
    const nonce = Date.now() * 1000 + "";
    const path = "/0/private/Balance";
    const body = { nonce };
    const message = qs.stringify(body);
    const hash = crypto.createHash("sha256").update(nonce + message).digest();
    const signature = crypto
      .createHmac("sha512", this.privateKey)
      .update(path + hash)
      .digest("base64");

    const response = await axios.post("https://api.kraken.com" + path, message, {
      headers: { 
        "API-Key": this.apiKey, 
        "API-Sign": signature,
        "User-Agent": "ChartWhisperer/1.0"
      },
      timeout: 10000
    });

    if (response.data.error && response.data.error.length > 0) {
      throw new Error(`Kraken API Error: ${response.data.error.join(', ')}`);
    }
  }

  async getBalance(): Promise<KrakenBalance> {
    const nonce = Date.now() * 1000 + "";
    const path = "/0/private/Balance";
    const body = { nonce };
    const message = qs.stringify(body);
    const hash = crypto.createHash("sha256").update(nonce + message).digest();
    const signature = crypto
      .createHmac("sha512", this.privateKey)
      .update(path + hash)
      .digest("base64");

    const response = await axios.post("https://api.kraken.com" + path, message, {
      headers: { 
        "API-Key": this.apiKey, 
        "API-Sign": signature 
      }
    });

    if (response.data.error && response.data.error.length > 0) {
      throw new Error(`Kraken Balance Error: ${response.data.error.join(', ')}`);
    }

    return response.data.result;
  }

  async getTicker(symbol: string): Promise<KrakenTicker> {
    const response = await axios.get(`https://api.kraken.com/0/public/Ticker?pair=${symbol}`);
    
    if (response.data.error && response.data.error.length > 0) {
      throw new Error(`Kraken Ticker Error: ${response.data.error.join(', ')}`);
    }

    const tickerData = response.data.result[symbol];
    
    return {
      symbol,
      price: parseFloat(tickerData.c[0]),
      volume: parseFloat(tickerData.v[1]),
      high: parseFloat(tickerData.h[1]),
      low: parseFloat(tickerData.l[1]),
      timestamp: Date.now()
    };
  }

  async getOrderBook(symbol: string, count: number = 100): Promise<KrakenOrderBook> {
    const response = await axios.get(`https://api.kraken.com/0/public/Depth?pair=${symbol}&count=${count}`);
    
    if (response.data.error && response.data.error.length > 0) {
      throw new Error(`Kraken OrderBook Error: ${response.data.error.join(', ')}`);
    }

    const orderBookData = response.data.result[symbol];
    
    return {
      symbol,
      bids: orderBookData.bids.map(([price, volume]: [string, string]) => [parseFloat(price), parseFloat(volume)]),
      asks: orderBookData.asks.map(([price, volume]: [string, string]) => [parseFloat(price), parseFloat(volume)]),
      timestamp: Date.now()
    };
  }

  private startDataStreams(): void {
    // Stream de precios cada 5 segundos
    setInterval(async () => {
      if (!this.isConnected) return;
      
      try {
        const btcTicker = await this.getTicker('XXBTZUSD');
        this.eventBus.emit('market.price_update', {
          exchange: 'kraken',
          symbol: 'BTC/USD',
          price: btcTicker.price,
          volume: btcTicker.volume,
          timestamp: btcTicker.timestamp
        });

        const ethTicker = await this.getTicker('XETHZUSD');
        this.eventBus.emit('market.price_update', {
          exchange: 'kraken',
          symbol: 'ETH/USD',
          price: ethTicker.price,
          volume: ethTicker.volume,
          timestamp: ethTicker.timestamp
        });
      } catch (error) {
        console.error('❌ KrakenConnector: Error en stream de precios:', error);
        this.handleConnectionError(error);
      }
    }, 5000);

    // Stream de balance cada 30 segundos
    setInterval(async () => {
      if (!this.isConnected) return;
      
      try {
        const balance = await this.getBalance();
        this.eventBus.emit('account.balance_update', {
          exchange: 'kraken',
          balance,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('❌ KrakenConnector: Error en stream de balance:', error);
        this.handleConnectionError(error);
      }
    }, 30000);
  }

  private handleConnectionError(error: any): void {
    console.error('🚨 KrakenConnector: Error de conexión:', error);
    this.isConnected = false;
    this.eventBus.emit('exchange.kraken.disconnected', { exchange: 'kraken', error: error.message });
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('💀 KrakenConnector: Máximo de intentos de reconexión alcanzado');
      this.eventBus.emit('exchange.kraken.failed', { exchange: 'kraken', reason: 'max_reconnect_attempts' });
      return;
    }

    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Backoff exponencial
    console.log(`🔄 KrakenConnector: Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts + 1})`);
    
    setTimeout(async () => {
      this.reconnectAttempts++;
      await this.initialize();
    }, delay);
  }

  async placeOrder(symbol: string, side: 'buy' | 'sell', amount: number, price?: number): Promise<any> {
    const nonce = Date.now() * 1000 + "";
    const path = "/0/private/AddOrder";
    
    const body: any = {
      nonce,
      pair: symbol,
      type: side,
      ordertype: price ? 'limit' : 'market',
      volume: amount.toString()
    };

    if (price) {
      body.price = price.toString();
    }

    const message = qs.stringify(body);
    const hash = crypto.createHash("sha256").update(nonce + message).digest();
    const signature = crypto
      .createHmac("sha512", this.privateKey)
      .update(path + hash)
      .digest("base64");

    const response = await axios.post("https://api.kraken.com" + path, message, {
      headers: { 
        "API-Key": this.apiKey, 
        "API-Sign": signature 
      }
    });

    if (response.data.error && response.data.error.length > 0) {
      throw new Error(`Kraken Order Error: ${response.data.error.join(', ')}`);
    }

    this.eventBus.emit('order.placed', {
      exchange: 'kraken',
      orderId: response.data.result.txid[0],
      symbol,
      side,
      amount,
      price,
      timestamp: Date.now()
    });

    return response.data.result;
  }

  getConnectionStatus(): { connected: boolean; exchange: string; reconnectAttempts: number } {
    return {
      connected: this.isConnected,
      exchange: 'kraken',
      reconnectAttempts: this.reconnectAttempts
    };
  }

  async shutdown(): Promise<void> {
    console.log('🔱 KrakenConnector: Cerrando conexión...');
    this.isConnected = false;
    this.eventBus.emit('exchange.kraken.shutdown', { exchange: 'kraken' });
  }
}
