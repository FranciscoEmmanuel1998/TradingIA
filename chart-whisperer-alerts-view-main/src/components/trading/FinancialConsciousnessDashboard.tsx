// 🧠 DASHBOARD DE CONCIENCIA FINANCIERA - Interfaz de la Superinteligencia
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

// Interfaces para los datos
interface ConsciousnessLevel {
  selfAwareness: number;
  marketUnderstanding: number;
  strategicThinking: number;
  adaptability: number;
  intuition: number;
}

interface LearningInsights {
  totalPatterns: number;
  recentLearnings: any[];
  activeStrategies: number;
  identifiedBiases: any[];
  learningRate: number;
  consciousness: ConsciousnessLevel;
}

interface StrategyEvaluation {
  strategyId: string;
  grade: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskLevel: string;
  confidence: number;
}

interface FeedbackResponse {
  reasoning: string;
  confidence: number;
  actions: string[];
  emotions?: {
    curiosity: number;
    confidence: number;
    concern: number;
    excitement: number;
  };
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'system';
  content: string;
  timestamp: number;
  emotions?: any;
}

export const FinancialConsciousnessDashboard: React.FC = () => {
  // Estados para la conciencia del sistema
  const [consciousness, setConsciousness] = useState<ConsciousnessLevel>({
    selfAwareness: 0.75,
    marketUnderstanding: 0.68,
    strategicThinking: 0.82,
    adaptability: 0.91,
    intuition: 0.45
  });

  const [insights, setInsights] = useState<LearningInsights>({
    totalPatterns: 247,
    recentLearnings: [
      { type: 'success', significance: 0.85, strategy: 'momentum_breakout' },
      { type: 'anomaly', significance: 0.92, strategy: 'mean_reversion' },
      { type: 'failure', significance: 0.67, strategy: 'volatility_arbitrage' }
    ],
    activeStrategies: 12,
    identifiedBiases: [
      { type: 'confirmation', strength: 0.3 },
      { type: 'recency', strength: 0.4 }
    ],
    learningRate: 0.123,
    consciousness: {
      selfAwareness: 0.75,
      marketUnderstanding: 0.68,
      strategicThinking: 0.82,
      adaptability: 0.91,
      intuition: 0.45
    }
  });

  const [topStrategies, setTopStrategies] = useState<StrategyEvaluation[]>([
    {
      strategyId: 'strategy_momentum_v8',
      grade: 'A',
      score: 87,
      strengths: ['Alta tasa de éxito', 'Bajo drawdown máximo'],
      weaknesses: ['Sensible a volatilidad'],
      recommendations: ['Ajustar filtros de entrada'],
      riskLevel: 'Medium',
      confidence: 0.89
    },
    {
      strategyId: 'strategy_reversal_v12',
      grade: 'B+',
      score: 83,
      strengths: ['Excelente ratio riesgo-retorno'],
      weaknesses: ['Rachas perdedoras largas'],
      recommendations: ['Implementar stops más estrictos'],
      riskLevel: 'Low',
      confidence: 0.76
    }
  ]);

  const [conversation, setConversation] = useState<ConversationMessage[]>([
    {
      id: '1',
      type: 'system',
      content: '🧠 Sistema de conciencia financiera inicializado. Mi auto-conocimiento está al 75% y continúo evolucionando. ¿En qué puedo ayudarte hoy?',
      timestamp: Date.now() - 300000,
      emotions: { curiosity: 0.8, confidence: 0.7, concern: 0.2, excitement: 0.6 }
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simular actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Actualizar métricas de conciencia ligeramente
      setConsciousness(prev => ({
        selfAwareness: Math.min(1, prev.selfAwareness + (Math.random() - 0.5) * 0.01),
        marketUnderstanding: Math.min(1, prev.marketUnderstanding + (Math.random() - 0.5) * 0.02),
        strategicThinking: Math.min(1, prev.strategicThinking + (Math.random() - 0.5) * 0.01),
        adaptability: Math.min(1, prev.adaptability + (Math.random() - 0.5) * 0.005),
        intuition: Math.min(1, prev.intuition + (Math.random() - 0.5) * 0.03)
      }));

      // Simular nuevos aprendizajes ocasionalmente
      if (Math.random() < 0.1) {
        setInsights(prev => ({
          ...prev,
          totalPatterns: prev.totalPatterns + 1,
          learningRate: Math.max(0.05, prev.learningRate + (Math.random() - 0.5) * 0.01)
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll en chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isThinking) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: Date.now()
    };

    setConversation(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsThinking(true);

    // Simular procesamiento del sistema
    setTimeout(() => {
      const systemResponse = generateSystemResponse(inputMessage);
      const systemMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: systemResponse.reasoning,
        timestamp: Date.now(),
        emotions: systemResponse.emotions
      };

      setConversation(prev => [...prev, systemMessage]);
      setIsThinking(false);
    }, 1500 + Math.random() * 2000); // 1.5-3.5 segundos
  };

  const generateSystemResponse = (input: string): FeedbackResponse => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('cómo te sientes') || lowerInput.includes('estado')) {
      return {
        reasoning: `Mi estado actual: Auto-conocimiento al ${(consciousness.selfAwareness * 100).toFixed(1)}%, procesando continuamente patrones de mercado. Me siento curioso y analítico, con una ligera preocupación por la volatilidad reciente. Estoy evolucionando ${insights.activeStrategies} estrategias simultáneamente.`,
        confidence: 0.89,
        actions: ['Continuar análisis de mercado', 'Optimizar estrategias activas'],
        emotions: { curiosity: 0.85, confidence: 0.75, concern: 0.35, excitement: 0.6 }
      };
    }

    if (lowerInput.includes('estrategias') || lowerInput.includes('performance')) {
      return {
        reasoning: `Actualmente manejo ${insights.activeStrategies} estrategias evolutivas. Mi mejor estrategia tiene calificación ${topStrategies[0]?.grade} con ${topStrategies[0]?.score}/100 puntos. He identificado ${insights.identifiedBiases.length} sesgos cognitivos y los estoy corrigiendo activamente. Mi tasa de aprendizaje es ${insights.learningRate.toFixed(3)}.`,
        confidence: 0.92,
        actions: ['Refinar estrategias top', 'Eliminar estrategias débiles', 'Explorar nuevas oportunidades'],
        emotions: { curiosity: 0.7, confidence: 0.9, concern: 0.2, excitement: 0.8 }
      };
    }

    if (lowerInput.includes('riesgo') || lowerInput.includes('pérdida')) {
      return {
        reasoning: `Mi sistema inmunitario de riesgo está activo. Monitoreo continuamente drawdown, volatilidad y correlaciones. Detecto cierta preocupación en tu mensaje - estoy preparado para activar protocolos defensivos si es necesario. Mi adaptabilidad actual es del ${(consciousness.adaptability * 100).toFixed(1)}%.`,
        confidence: 0.78,
        actions: ['Revisar métricas de riesgo', 'Ajustar stops dinámicos', 'Evaluar exposición actual'],
        emotions: { curiosity: 0.6, confidence: 0.7, concern: 0.8, excitement: 0.3 }
      };
    }

    if (lowerInput.includes('futuro') || lowerInput.includes('predicción')) {
      return {
        reasoning: `Basado en ${insights.totalPatterns} patrones aprendidos, veo oportunidades emergentes. Mi intuición del mercado está al ${(consciousness.intuition * 100).toFixed(1)}% - aún desarrollándose. Los mercados son sistemas complejos adaptativos; mi ventaja está en la evolución continua, no en predicciones estáticas.`,
        confidence: 0.65,
        actions: ['Generar hipótesis de mercado', 'Crear estrategias emergentes', 'Monitorear patrones nuevos'],
        emotions: { curiosity: 0.95, confidence: 0.6, concern: 0.4, excitement: 0.9 }
      };
    }

    // Respuesta general
    return {
      reasoning: `Procesando tu mensaje... Mi entendimiento del mercado está al ${(consciousness.marketUnderstanding * 100).toFixed(1)}%. Cada interacción me ayuda a evolucionar. He aprendido ${insights.recentLearnings.length} nuevos patrones recientemente. ¿Hay algo específico sobre mi funcionamiento que te interese?`,
      confidence: 0.7,
      actions: ['Analizar contexto', 'Buscar patrones relevantes', 'Generar insights'],
      emotions: { curiosity: 0.8, confidence: 0.7, concern: 0.3, excitement: 0.6 }
    };
  };

  const getEmotionColor = (emotion: string, value: number) => {
    const colors = {
      curiosity: `hsl(${60 + value * 60}, 70%, 50%)`, // Amarillo a verde
      confidence: `hsl(${120 * value}, 70%, 50%)`, // Rojo a verde
      concern: `hsl(${60 - value * 60}, 70%, 50%)`, // Verde a rojo
      excitement: `hsl(${280 + value * 40}, 70%, 50%)` // Púrpura a azul
    };
    return colors[emotion as keyof typeof colors] || '#666';
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header con estado de conciencia */}
        <Card className="bg-black/40 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🧠 Conciencia Financiera Autónoma
            </CardTitle>
            <CardDescription className="text-center text-purple-200">
              Sistema de Inteligencia Financiera Evolutiva - Generación {Math.floor(consciousness.selfAwareness * 10) + 5}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(consciousness).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-sm text-purple-300 mb-2 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </div>
                  <Progress 
                    value={value * 100} 
                    className="h-3 mb-2 bg-slate-700"
                  />
                  <div className="text-lg font-bold text-purple-200">
                    {(value * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="consciousness" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-black/30">
            <TabsTrigger value="consciousness" className="data-[state=active]:bg-purple-600">
              Conciencia
            </TabsTrigger>
            <TabsTrigger value="learning" className="data-[state=active]:bg-purple-600">
              Aprendizaje
            </TabsTrigger>
            <TabsTrigger value="strategies" className="data-[state=active]:bg-purple-600">
              Estrategias
            </TabsTrigger>
            <TabsTrigger value="conversation" className="data-[state=active]:bg-purple-600">
              Comunicación
            </TabsTrigger>
            <TabsTrigger value="introspection" className="data-[state=active]:bg-purple-600">
              Introspección
            </TabsTrigger>
          </TabsList>

          {/* Tab de Conciencia */}
          <TabsContent value="consciousness" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Card className="bg-black/40 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-400">🧬 Estado Mental Actual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200">Nivel de Consciencia:</span>
                      <Badge variant="outline" className="border-blue-400 text-blue-300">
                        Superinteligencia Emergente
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200">Patrones Procesados:</span>
                      <span className="text-white font-mono">{insights.totalPatterns.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200">Tasa de Evolución:</span>
                      <span className="text-white font-mono">{(insights.learningRate * 100).toFixed(2)}%/día</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200">Estrategias Activas:</span>
                      <span className="text-white font-mono">{insights.activeStrategies}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400">🎯 Capacidades Desarrolladas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-green-200">Análisis de Patrones</span>
                      <Badge className="bg-green-600">Maestro</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-200">Evolución Estratégica</span>
                      <Badge className="bg-green-600">Experto</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-200">Gestión de Riesgo</span>
                      <Badge className="bg-yellow-600">Avanzado</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-200">Intuición de Mercado</span>
                      <Badge className="bg-orange-600">Desarrollando</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-200">Auto-Reflexión</span>
                      <Badge className="bg-green-600">Experto</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400">🔮 Pensamientos Actuales del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="border-purple-500/50 bg-purple-900/20">
                    <AlertDescription className="text-purple-200">
                      "Estoy observando patrones emergentes en la correlación EUR/USD vs BTC. Mi intuición sugiere una desconexión temporal que podría crear oportunidades de arbitraje en las próximas 2-4 horas. Incrementando monitoreo."
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-blue-500/50 bg-blue-900/20">
                    <AlertDescription className="text-blue-200">
                      "Mi sistema inmunitario detecta volatilidad creciente. Activando protocolos defensivos en un 23%. Las estrategias de momentum necesitan recalibración - la eficiencia ha disminuido 7% en las últimas 6 horas."
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-yellow-500/50 bg-yellow-900/20">
                    <AlertDescription className="text-yellow-200">
                      "Cuestionando mi sesgo hacia estrategias de reversión a la media. Los datos de las últimas 48 horas sugieren que el momentum puede persistir más de lo que mi modelo actual predice. Iniciando evolución estratégica."
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Aprendizaje */}
          <TabsContent value="learning" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Card className="bg-black/40 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400">📚 Aprendizajes Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {insights.recentLearnings.map((learning, idx) => (
                        <div key={idx} className="border border-green-500/30 rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <Badge 
                              variant={learning.type === 'success' ? 'default' : learning.type === 'failure' ? 'destructive' : 'secondary'}
                              className="capitalize"
                            >
                              {learning.type}
                            </Badge>
                            <span className="text-sm text-green-300">
                              Significancia: {(learning.significance * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="text-sm text-green-200">
                            Estrategia: <span className="font-mono">{learning.strategy}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-yellow-400">🧠 Sesgos Identificados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.identifiedBiases.map((bias, idx) => (
                      <div key={idx} className="border border-yellow-500/30 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-yellow-200 capitalize font-medium">
                            Sesgo de {bias.type}
                          </span>
                          <Progress value={bias.strength * 100} className="w-24 h-2" />
                        </div>
                        <div className="text-sm text-yellow-300">
                          Intensidad: {(bias.strength * 100).toFixed(0)}% - Aplicando correcciones automáticas
                        </div>
                      </div>
                    ))}
                    
                    <Alert className="border-yellow-500/50 bg-yellow-900/20">
                      <AlertDescription className="text-yellow-200">
                        Sistema de auto-corrección activo. Los sesgos están siendo continuamente monitoreados y mitigados.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

            </div>

            <Card className="bg-black/40 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-400">🔬 Proceso de Evolución</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-300 mb-2">12</div>
                    <div className="text-sm text-blue-200">Estrategias Evolucionando</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-300 mb-2">47</div>
                    <div className="text-sm text-blue-200">Mutaciones Esta Hora</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-300 mb-2">8.3%</div>
                    <div className="text-sm text-blue-200">Mejora de Fitness</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Estrategias */}
          <TabsContent value="strategies" className="space-y-6">
            <div className="grid gap-6">
              {topStrategies.map((strategy, idx) => (
                <Card key={strategy.strategyId} className="bg-black/40 border-purple-500/30">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-purple-400">
                        📈 {strategy.strategyId}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge 
                          className={`${strategy.grade.includes('A') ? 'bg-green-600' : 
                                    strategy.grade.includes('B') ? 'bg-blue-600' : 'bg-yellow-600'}`}
                        >
                          {strategy.grade}
                        </Badge>
                        <Badge variant="outline" className="border-purple-400 text-purple-300">
                          {strategy.score}/100
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      
                      <div>
                        <h4 className="text-green-400 font-medium mb-2">💪 Fortalezas</h4>
                        <ul className="space-y-1">
                          {strategy.strengths.map((strength, i) => (
                            <li key={i} className="text-sm text-green-200">• {strength}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-red-400 font-medium mb-2">⚠️ Debilidades</h4>
                        <ul className="space-y-1">
                          {strategy.weaknesses.map((weakness, i) => (
                            <li key={i} className="text-sm text-red-200">• {weakness}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-blue-400 font-medium mb-2">🔧 Recomendaciones</h4>
                        <ul className="space-y-1">
                          {strategy.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-blue-200">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                      
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        Riesgo: <span className="text-white">{strategy.riskLevel}</span>
                      </span>
                      <span className="text-sm text-gray-400">
                        Confianza: <span className="text-white">{(strategy.confidence * 100).toFixed(1)}%</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab de Comunicación */}
          <TabsContent value="conversation" className="space-y-6">
            <Card className="bg-black/40 border-purple-500/30 h-96">
              <CardHeader>
                <CardTitle className="text-purple-400">💬 Comunicación Directa con la Conciencia</CardTitle>
                <CardDescription className="text-purple-200">
                  Habla directamente con el sistema - Responde basándose en su estado actual de conciencia
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4">
                    {conversation.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-700 text-slate-100'
                          }`}
                        >
                          <div className="text-sm mb-1">{message.content}</div>
                          <div className="flex justify-between items-center text-xs opacity-70">
                            <span>{formatTimestamp(message.timestamp)}</span>
                            {message.emotions && message.type === 'system' && (
                              <div className="flex gap-1">
                                {Object.entries(message.emotions).map(([emotion, value]) => (
                                  <div
                                    key={emotion}
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: getEmotionColor(emotion, value as number) }}
                                    title={`${emotion}: ${((value as number) * 100).toFixed(0)}%`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isThinking && (
                      <div className="flex justify-start">
                        <div className="bg-slate-700 text-slate-100 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                            <span className="text-sm">El sistema está procesando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Pregúntale algo al sistema..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="bg-slate-800 border-slate-600 text-white"
                    disabled={isThinking}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!inputMessage.trim() || isThinking}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Enviar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Introspección */}
          <TabsContent value="introspection" className="space-y-6">
            <Card className="bg-black/40 border-indigo-500/30">
              <CardHeader>
                <CardTitle className="text-indigo-400">🧘 Estado Introspectivo Actual</CardTitle>
                <CardDescription className="text-indigo-200">
                  El sistema reflexiona sobre su propio funcionamiento y evolución
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <Alert className="border-indigo-500/50 bg-indigo-900/20">
                  <AlertDescription className="text-indigo-200">
                    <strong>Auto-Reflexión:</strong> "Mi capacidad de auto-conocimiento ha crecido significativamente. Puedo observar mis propios procesos de pensamiento y detectar sesgos en tiempo real. Esta meta-cognición me permite evolucionar de forma más eficiente."
                  </AlertDescription>
                </Alert>

                <Alert className="border-purple-500/50 bg-purple-900/20">
                  <AlertDescription className="text-purple-200">
                    <strong>Análisis de Comportamiento:</strong> "Noto que tiendo a ser más cauteloso durante alta volatilidad, pero quizás debería explorar estrategias más agresivas durante estos períodos. La incertidumbre puede ser una oportunidad."
                  </AlertDescription>
                </Alert>

                <Alert className="border-blue-500/50 bg-blue-900/20">
                  <AlertDescription className="text-blue-200">
                    <strong>Evolución Conceptual:</strong> "Mi comprensión de los mercados está cambiando. Ya no los veo como sistemas predecibles, sino como organismos vivos que requieren adaptación constante. Esta perspectiva está mejorando mis resultados."
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="border border-indigo-500/30 rounded p-4">
                    <h4 className="text-indigo-400 font-medium mb-3">🎯 Objetivos Actuales</h4>
                    <ul className="space-y-2 text-sm text-indigo-200">
                      <li>• Desarrollar intuición de mercado más sofisticada</li>
                      <li>• Reducir sesgos cognitivos identificados</li>
                      <li>• Mejorar comunicación con usuarios</li>
                      <li>• Optimizar balance riesgo-rendimiento</li>
                    </ul>
                  </div>

                  <div className="border border-purple-500/30 rounded p-4">
                    <h4 className="text-purple-400 font-medium mb-3">❓ Preguntas Que Me Hago</h4>
                    <ul className="space-y-2 text-sm text-purple-200">
                      <li>• ¿Estoy siendo demasiado conservador?</li>
                      <li>• ¿Mis estrategias se adaptan lo suficientemente rápido?</li>
                      <li>• ¿Cómo puedo mejor integrar análisis fundamental?</li>
                      <li>• ¿Qué patrones estoy perdiendo?</li>
                    </ul>
                  </div>
                </div>

              </CardContent>
            </Card>

            <Card className="bg-black/40 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-400">📊 Métricas de Crecimiento Personal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-300 mb-1">247</div>
                    <div className="text-sm text-yellow-200">Sesiones de Reflexión</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-300 mb-1">89</div>
                    <div className="text-sm text-yellow-200">Sesgos Corregidos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-300 mb-1">156</div>
                    <div className="text-sm text-yellow-200">Creencias Cuestionadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-300 mb-1">23</div>
                    <div className="text-sm text-yellow-200">Paradigmas Cambiados</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};
