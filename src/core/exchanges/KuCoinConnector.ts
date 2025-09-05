// 🟡 KUCOIN CONNECTOR - Conexión Real con KuCoin Exchange
import axios from "axios";
import crypto from "crypto";
import { EventBus } from '../../circulation/channels/EventBus';

export interface KuCoinBalance {
  currency: string;
  balance: string;
  available: string;
  holds: string;
}

export interface KuCoinTicker {
  symbol: string;
  price: number;
  size: number;
  bestBid: number;
  bestAsk: number;
  volume: number;
  timestamp: number;
}

export interface KuCoinOrderBook {
  symbol: string;
  bids: [string, string][];
  asks: [string, string][];
  timestamp: number;
}

export class KuCoinConnector {
  private eventBus: EventBus;
  private apiKey: string;
  private apiSecret: string;
  private passphrase: string;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private baseUrl: string = 'https://api.kucoin.com';

  constructor(apiKey: string, apiSecret: string, passphrase: string) {
    this.eventBus = EventBus.getInstance();
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.passphrase = passphrase;
  }

  async initialize(): Promise<void> {
    console.log('🟡 KuCoinConnector: Inicializando conexión con KuCoin...');
    
    try {
      await this.testConnection();
      this.isConnected = true;
      this.startDataStreams();
      
      console.log('✅ KuCoinConnector: Conectado exitosamente a KuCoin');
      this.eventBus.emit('exchange.kucoin.connected', { exchange: 'kucoin', status: 'connected' });
    } catch (error) {
      console.error('❌ KuCoinConnector: Error conectando a KuCoin:', error);
      this.scheduleReconnect();
    }
  }

  private generateSignature(timestamp: string, method: string, endpoint: string, body: string = ''): string {
    const message = timestamp + method + endpoint + body;
    return crypto.createHmac('sha256', this.apiSecret).update(message).digest('base64');
  }

  private generatePassphraseSignature(): string {
    return crypto.createHmac('sha256', this.apiSecret).update(this.passphrase).digest('base64');
  }

  private async makeRequest(method: string, endpoint: string, body?: any): Promise<any> {
    const timestamp = Date.now().toString();
    const bodyString = body ? JSON.stringify(body) : '';
    const signature = this.generateSignature(timestamp, method.toUpperCase(), endpoint, bodyString);
    const passphraseSignature = this.generatePassphraseSignature();

    const headers = {
      'KC-API-KEY': this.apiKey,
      'KC-API-SIGN': signature,
      'KC-API-TIMESTAMP': timestamp,
      'KC-API-PASSPHRASE': passphraseSignature,
      'KC-API-KEY-VERSION': '2',
      'Content-Type': 'application/json',
      'User-Agent': 'ChartWhisperer/1.0'
    };

    const config: any = {
      method,
      url: this.baseUrl + endpoint,
      headers,
      timeout: 10000
    };

    if (body && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
      config.data = body;
    }

    const response = await axios(config);
    
    if (response.data.code !== '200000') {
      throw new Error(`KuCoin API Error: ${response.data.msg || 'Unknown error'}`);
    }

    return response.data.data;
  }

  private async testConnection(): Promise<void> {
    const response = await axios.get(`${this.baseUrl}/api/v1/timestamp`);
    if (!response.data || !response.data.data) {
      throw new Error('Respuesta inválida de KuCoin API');
    }
  }

  async getAccounts(): Promise<KuCoinBalance[]> {
    return await this.makeRequest('GET', '/api/v1/accounts');
  }

  async getTicker(symbol: string): Promise<KuCoinTicker> {
    const data = await this.makeRequest('GET', `/api/v1/market/orderbook/level1?symbol=${symbol}`);
    
    return {
      symbol,
      price: parseFloat(data.price),
      size: parseFloat(data.size),
      bestBid: parseFloat(data.bestBid),
      bestAsk: parseFloat(data.bestAsk),
      volume: 0, // KuCoin level1 no incluye volumen
      timestamp: Date.now()
    };
  }

  async getAllTickers(): Promise<any> {
    return await this.makeRequest('GET', '/api/v1/market/allTickers');
  }

  async getOrderBook(symbol: string): Promise<KuCoinOrderBook> {
    const data = await this.makeRequest('GET', `/api/v1/market/orderbook/level2_20?symbol=${symbol}`);
    
    return {
      symbol,
      bids: data.bids || [],
      asks: data.asks || [],
      timestamp: Date.now()
    };
  }

  async get24hrStats(symbol: string): Promise<any> {
    return await this.makeRequest('GET', `/api/v1/market/stats?symbol=${symbol}`);
  }

  private startDataStreams(): void {
    // Stream de precios cada 5 segundos
    setInterval(async () => {
      if (!this.isConnected) return;
      
      try {
        const btcTicker = await this.getTicker('BTC-USDT');
        this.eventBus.emit('market.price_update', {
          exchange: 'kucoin',
          symbol: 'BTC/USDT',
          price: btcTicker.price,
          bestBid: btcTicker.bestBid,
          bestAsk: btcTicker.bestAsk,
          timestamp: btcTicker.timestamp
        });

        const ethTicker = await this.getTicker('ETH-USDT');
        this.eventBus.emit('market.price_update', {
          exchange: 'kucoin',
          symbol: 'ETH/USDT',
          price: ethTicker.price,
          bestBid: ethTicker.bestBid,
          bestAsk: ethTicker.bestAsk,
          timestamp: ethTicker.timestamp
        });
      } catch (error) {
        console.error('❌ KuCoinConnector: Error en stream de precios:', error);
        this.handleConnectionError(error);
      }
    }, 5000);

    // Stream de balance cada 30 segundos
    setInterval(async () => {
      if (!this.isConnected) return;
      
      try {
        const accounts = await this.getAccounts();
        this.eventBus.emit('account.balance_update', {
          exchange: 'kucoin',
          accounts,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('❌ KuCoinConnector: Error en stream de balance:', error);
        this.handleConnectionError(error);
      }
    }, 30000);

    // Stream de estadísticas cada 60 segundos
    setInterval(async () => {
      if (!this.isConnected) return;
      
      try {
        const btcStats = await this.get24hrStats('BTC-USDT');
        const ethStats = await this.get24hrStats('ETH-USDT');
        
        this.eventBus.emit('market.stats_update', {
          exchange: 'kucoin',
          stats: {
            'BTC-USDT': btcStats,
            'ETH-USDT': ethStats
          },
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('❌ KuCoinConnector: Error en stream de estadísticas:', error);
        this.handleConnectionError(error);
      }
    }, 60000);
  }

  async placeOrder(symbol: string, side: 'buy' | 'sell', size: string, price?: string, type: string = 'limit'): Promise<any> {
    const orderData: any = {
      clientOid: crypto.randomUUID(),
      side,
      symbol,
      type,
      size
    };

    if (type === 'limit' && price) {
      orderData.price = price;
    }

    const result = await this.makeRequest('POST', '/api/v1/orders', orderData);

    this.eventBus.emit('order.placed', {
      exchange: 'kucoin',
      orderId: result.orderId,
      symbol,
      side,
      size,
      price,
      type,
      timestamp: Date.now()
    });

    return result;
  }

  async cancelOrder(orderId: string): Promise<any> {
    return await this.makeRequest('DELETE', `/api/v1/orders/${orderId}`);
  }

  async getOrder(orderId: string): Promise<any> {
    return await this.makeRequest('GET', `/api/v1/orders/${orderId}`);
  }

  async getOrders(symbol?: string, status?: string): Promise<any> {
    let endpoint = '/api/v1/orders';
    const params: string[] = [];
    
    if (symbol) params.push(`symbol=${symbol}`);
    if (status) params.push(`status=${status}`);
    
    if (params.length > 0) {
      endpoint += '?' + params.join('&');
    }
    
    return await this.makeRequest('GET', endpoint);
  }

  private handleConnectionError(error: any): void {
    console.error('🚨 KuCoinConnector: Error de conexión:', error);
    this.isConnected = false;
    this.eventBus.emit('exchange.kucoin.disconnected', { exchange: 'kucoin', error: error.message });
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('💀 KuCoinConnector: Máximo de intentos de reconexión alcanzado');
      this.eventBus.emit('exchange.kucoin.failed', { exchange: 'kucoin', reason: 'max_reconnect_attempts' });
      return;
    }

    const delay = Math.pow(2, this.reconnectAttempts) * 1000;
    console.log(`🔄 KuCoinConnector: Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts + 1})`);
    
    setTimeout(async () => {
      this.reconnectAttempts++;
      await this.initialize();
    }, delay);
  }

  getConnectionStatus(): { connected: boolean; exchange: string; reconnectAttempts: number } {
    return {
      connected: this.isConnected,
      exchange: 'kucoin',
      reconnectAttempts: this.reconnectAttempts
    };
  }

  async shutdown(): Promise<void> {
    console.log('🟡 KuCoinConnector: Cerrando conexión...');
    this.isConnected = false;
    this.eventBus.emit('exchange.kucoin.shutdown', { exchange: 'kucoin' });
  }
}
