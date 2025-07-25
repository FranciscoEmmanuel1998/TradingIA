// 🪙 COINBASE ADVANCED TRADE CONNECTOR - Conexión Real con Coinbase
import axios from "axios";
import * as sodium from "libsodium-wrappers-sumo";
import { randomBytes } from "crypto";
import base64url from "base64url";
import { EventBus } from '../../circulation/channels/EventBus';

export interface CoinbaseAccount {
  uuid: string;
  name: string;
  currency: string;
  available_balance: {
    value: string;
    currency: string;
  };
  default: boolean;
}

export interface CoinbaseTicker {
  symbol: string;
  price: number;
  volume_24h: number;
  price_change_24h: number;
  timestamp: number;
}

export interface CoinbaseProduct {
  product_id: string;
  price: string;
  price_percentage_change_24h: string;
  volume_24h: string;
  volume_percentage_change_24h: string;
  base_increment: string;
  quote_increment: string;
  quote_min_size: string;
  quote_max_size: string;
  base_min_size: string;
  base_max_size: string;
  base_name: string;
  quote_name: string;
  watched: boolean;
  is_disabled: boolean;
  new: boolean;
  status: string;
  cancel_only: boolean;
  limit_only: boolean;
  post_only: boolean;
  trading_disabled: boolean;
  auction_mode: boolean;
  product_type: string;
  quote_currency_id: string;
  base_currency_id: string;
  mid_market_price: string;
}

export class CoinbaseAdvancedConnector {
  private eventBus: EventBus;
  private keyId: string;
  private privateKey: string;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(keyId: string, privateKey: string) {
    this.eventBus = EventBus.getInstance();
    this.keyId = keyId;
    this.privateKey = privateKey;
  }

  async initialize(): Promise<void> {
    console.log('🪙 CoinbaseAdvancedConnector: Inicializando conexión con Coinbase Advanced Trade...');
    
    try {
      await sodium.ready;
      await this.testConnection();
      this.isConnected = true;
      this.startDataStreams();
      
      console.log('✅ CoinbaseAdvancedConnector: Conectado exitosamente a Coinbase Advanced Trade');
      this.eventBus.emit('exchange.coinbase.connected', { exchange: 'coinbase', status: 'connected' });
    } catch (error) {
      console.error('❌ CoinbaseAdvancedConnector: Error conectando a Coinbase:', error);
      this.scheduleReconnect();
    }
  }

  private async makeJwt(uri: string, method: string = "GET"): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const header = { 
      typ: "JWT", 
      alg: "EdDSA", 
      kid: this.keyId, 
      nonce: randomBytes(16).toString("hex")
    };
    const payload = { 
      iss: "cdp", 
      sub: this.keyId, 
      uri, 
      mth: method, 
      nbf: now, 
      exp: now + 120 
    };

    const encode = (o: object) => base64url(JSON.stringify(o));
    const headerPayload = `${encode(header)}.${encode(payload)}`;

    const signature = sodium.crypto_sign_detached(
      headerPayload,
      Buffer.from(this.privateKey, "base64")
    );
    
    return `${headerPayload}.${base64url(Buffer.from(signature))}`;
  }

  private async testConnection(): Promise<void> {
    const path = "/platform/v1/time";
    const jwt = await this.makeJwt(path, "GET");

    const response = await axios.get("https://api.cdp.coinbase.com" + path, {
      headers: { 
        Authorization: `Bearer ${jwt}`,
        "User-Agent": "ChartWhisperer/1.0"
      },
      timeout: 10000
    });

    if (!response.data || !response.data.iso) {
      throw new Error('Respuesta inválida de Coinbase API');
    }
  }

  async getAccounts(): Promise<CoinbaseAccount[]> {
    const path = "/platform/v1/accounts";
    const jwt = await this.makeJwt(path, "GET");

    const response = await axios.get("https://api.cdp.coinbase.com" + path, {
      headers: { Authorization: `Bearer ${jwt}` }
    });

    return response.data.accounts || [];
  }

  async getProducts(): Promise<CoinbaseProduct[]> {
    const path = "/platform/v1/products";
    const jwt = await this.makeJwt(path, "GET");

    const response = await axios.get("https://api.cdp.coinbase.com" + path, {
      headers: { Authorization: `Bearer ${jwt}` }
    });

    return response.data.products || [];
  }

  async getTicker(productId: string): Promise<CoinbaseTicker> {
    const path = `/platform/v1/products/${productId}/ticker`;
    const jwt = await this.makeJwt(path, "GET");

    const response = await axios.get("https://api.cdp.coinbase.com" + path, {
      headers: { Authorization: `Bearer ${jwt}` }
    });

    const ticker = response.data;
    
    return {
      symbol: productId,
      price: parseFloat(ticker.price),
      volume_24h: parseFloat(ticker.volume_24h),
      price_change_24h: parseFloat(ticker.price_percentage_change_24h),
      timestamp: Date.now()
    };
  }

  async getProductBook(productId: string, limit: number = 100): Promise<any> {
    const path = `/platform/v1/products/${productId}/book?limit=${limit}`;
    const jwt = await this.makeJwt(path, "GET");

    const response = await axios.get("https://api.cdp.coinbase.com" + path, {
      headers: { Authorization: `Bearer ${jwt}` }
    });

    return {
      product_id: productId,
      bids: response.data.bids?.map(([price, size]: [string, string]) => [parseFloat(price), parseFloat(size)]) || [],
      asks: response.data.asks?.map(([price, size]: [string, string]) => [parseFloat(price), parseFloat(size)]) || [],
      timestamp: Date.now()
    };
  }

  private startDataStreams(): void {
    // Stream de precios cada 5 segundos
    setInterval(async () => {
      if (!this.isConnected) return;
      
      try {
        const btcTicker = await this.getTicker('BTC-USD');
        this.eventBus.emit('market.price_update', {
          exchange: 'coinbase',
          symbol: 'BTC/USD',
          price: btcTicker.price,
          volume: btcTicker.volume_24h,
          change_24h: btcTicker.price_change_24h,
          timestamp: btcTicker.timestamp
        });

        const ethTicker = await this.getTicker('ETH-USD');
        this.eventBus.emit('market.price_update', {
          exchange: 'coinbase',
          symbol: 'ETH/USD',
          price: ethTicker.price,
          volume: ethTicker.volume_24h,
          change_24h: ethTicker.price_change_24h,
          timestamp: ethTicker.timestamp
        });
      } catch (error) {
        console.error('❌ CoinbaseAdvancedConnector: Error en stream de precios:', error);
        this.handleConnectionError(error);
      }
    }, 5000);

    // Stream de balance cada 30 segundos
    setInterval(async () => {
      if (!this.isConnected) return;
      
      try {
        const accounts = await this.getAccounts();
        this.eventBus.emit('account.balance_update', {
          exchange: 'coinbase',
          accounts,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('❌ CoinbaseAdvancedConnector: Error en stream de balance:', error);
        this.handleConnectionError(error);
      }
    }, 30000);

    // Stream de productos cada 60 segundos
    setInterval(async () => {
      if (!this.isConnected) return;
      
      try {
        const products = await this.getProducts();
        this.eventBus.emit('market.products_update', {
          exchange: 'coinbase',
          products,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('❌ CoinbaseAdvancedConnector: Error en stream de productos:', error);
        this.handleConnectionError(error);
      }
    }, 60000);
  }

  async placeOrder(productId: string, side: 'buy' | 'sell', amount: number, price?: number): Promise<any> {
    const path = "/platform/v1/orders";
    const jwt = await this.makeJwt(path, "POST");

    const orderData: any = {
      product_id: productId,
      side,
      size: amount.toString(),
      type: price ? 'limit' : 'market'
    };

    if (price) {
      orderData.price = price.toString();
    }

    const response = await axios.post("https://api.cdp.coinbase.com" + path, orderData, {
      headers: { 
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      }
    });

    this.eventBus.emit('order.placed', {
      exchange: 'coinbase',
      orderId: response.data.order_id,
      productId,
      side,
      amount,
      price,
      timestamp: Date.now()
    });

    return response.data;
  }

  private handleConnectionError(error: any): void {
    console.error('🚨 CoinbaseAdvancedConnector: Error de conexión:', error);
    this.isConnected = false;
    this.eventBus.emit('exchange.coinbase.disconnected', { exchange: 'coinbase', error: error.message });
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('💀 CoinbaseAdvancedConnector: Máximo de intentos de reconexión alcanzado');
      this.eventBus.emit('exchange.coinbase.failed', { exchange: 'coinbase', reason: 'max_reconnect_attempts' });
      return;
    }

    const delay = Math.pow(2, this.reconnectAttempts) * 1000;
    console.log(`🔄 CoinbaseAdvancedConnector: Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts + 1})`);
    
    setTimeout(async () => {
      this.reconnectAttempts++;
      await this.initialize();
    }, delay);
  }

  getConnectionStatus(): { connected: boolean; exchange: string; reconnectAttempts: number } {
    return {
      connected: this.isConnected,
      exchange: 'coinbase',
      reconnectAttempts: this.reconnectAttempts
    };
  }

  async shutdown(): Promise<void> {
    console.log('🪙 CoinbaseAdvancedConnector: Cerrando conexión...');
    this.isConnected = false;
    this.eventBus.emit('exchange.coinbase.shutdown', { exchange: 'coinbase' });
  }
}
