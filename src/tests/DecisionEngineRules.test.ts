import { DecisionEngine } from '../core/brain/DecisionEngine';
import { socketIOFeedAdapter } from '../core/feeds/SocketIOFeedAdapter';

export async function runDecisionEngineRuleTests() {
  const engine: any = new DecisionEngine();
  await engine.initialize();

  // Mock indicator calculations for BUY
  engine.calculateEMA = (_s: string, p: number) => p === 20 ? 105 : 100;
  engine.calculateRSI = () => 25;
  engine.calculateMACD = () => 1;
  const buyDecision = engine.analyzeMarketSignal({ symbol: 'BTC/USD' });
  if (buyDecision.action !== 'buy' || !buyDecision.shouldExecute) {
    throw new Error('Buy rule not triggered');
  }

  // Mock indicator calculations for SELL
  engine.calculateEMA = (_s: string, p: number) => p === 20 ? 95 : 100;
  engine.calculateRSI = () => 75;
  engine.calculateMACD = () => -1;
  const sellDecision = engine.analyzeMarketSignal({ symbol: 'BTC/USD' });
  if (sellDecision.action !== 'sell' || !sellDecision.shouldExecute) {
    throw new Error('Sell rule not triggered');
  }

  console.log('✅ DecisionEngine indicator rules passed');
  engine.stop?.();
  socketIOFeedAdapter.stop();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runDecisionEngineRuleTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
