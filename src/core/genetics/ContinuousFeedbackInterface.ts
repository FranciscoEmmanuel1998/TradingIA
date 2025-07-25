// 🔄 INTERFAZ DE RETROALIMENTACIÓN CONTINUA - Comunicación Directa con la Conciencia
import { EventBus } from '../../circulation/channels/EventBus';
import { AutonomousLearningEngine } from './AutonomousLearningEngine';
import { StrategyEvaluationEngine } from './StrategyEvaluationEngine';

export interface FeedbackInput {
  id: string;
  timestamp: number;
  source: 'user' | 'system' | 'market' | 'external';
  type: 'performance' | 'strategy' | 'risk' | 'general' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  content: string;
  data?: any;
  expectedResponse: boolean;
}

export interface SystemResponse {
  feedbackId: string;
  timestamp: number;
  confidence: number;
  reasoning: string;
  actions: string[];
  adaptations: string[];
  questions: string[];
  emotions?: {
    curiosity: number;
    confidence: number;
    concern: number;
    excitement: number;
  };
}

export interface ConversationContext {
  userId?: string;
  sessionId: string;
  startTime: number;
  totalExchanges: number;
  topics: string[];
  systemMood: 'analytical' | 'curious' | 'confident' | 'cautious' | 'learning';
  userTrust: number; // 0-1
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
}

export interface AdaptationRule {
  id: string;
  trigger: string;
  condition: string;
  action: string;
  priority: number;
  active: boolean;
  createdAt: number;
  lastTriggered?: number;
  effectiveness: number;
}

export class ContinuousFeedbackInterface {
  private eventBus: EventBus;
  private learningEngine: AutonomousLearningEngine;
  private evaluationEngine: StrategyEvaluationEngine;
  private feedbackHistory: Map<string, FeedbackInput[]>;
  private conversationContexts: Map<string, ConversationContext>;
  private adaptationRules: Map<string, AdaptationRule>;
  private systemPersonality: {
    analytical: number;
    creative: number;
    cautious: number;
    aggressive: number;
    empathetic: number;
  };
  
  constructor(learningEngine: AutonomousLearningEngine, evaluationEngine: StrategyEvaluationEngine) {
    this.eventBus = EventBus.getInstance();
    this.learningEngine = learningEngine;
    this.evaluationEngine = evaluationEngine;
    this.feedbackHistory = new Map();
    this.conversationContexts = new Map();
    this.adaptationRules = new Map();
    this.systemPersonality = {
      analytical: 0.8,
      creative: 0.6,
      cautious: 0.7,
      aggressive: 0.4,
      empathetic: 0.5
    };
  }

  async initialize(): Promise<void> {
    console.log('🔄 ContinuousFeedbackInterface: Inicializando comunicación con conciencia...');
    
    // Suscribirse a eventos del sistema
    this.eventBus.subscribe('user.feedback_submitted', this.processFeedback.bind(this));
    this.eventBus.subscribe('system.performance_alert', this.handlePerformanceAlert.bind(this));
    this.eventBus.subscribe('learning.insights_generated', this.shareInsights.bind(this));
    this.eventBus.subscribe('strategy.evaluation_completed', this.reportEvaluation.bind(this));
    this.eventBus.subscribe('risk.threshold_exceeded', this.escalateRiskConcern.bind(this));
    
    // Inicializar reglas de adaptación
    this.initializeAdaptationRules();
    
    // Iniciar ciclos de comunicación
    this.startCommunicationCycles();
    
    console.log('✅ ContinuousFeedbackInterface: Sistema de comunicación activo - Listo para interactuar');
  }

  async submitFeedback(
    content: string, 
    type: FeedbackInput['type'] = 'general',
    severity: FeedbackInput['severity'] = 'medium',
    sessionId?: string,
    data?: any
  ): Promise<SystemResponse> {
    
    const feedback: FeedbackInput = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      source: 'user',
      type,
      severity,
      content,
      data,
      expectedResponse: true
    };

    console.log(`📥 Recibiendo feedback: "${content}" (${type}/${severity})`);
    
    // Obtener o crear contexto de conversación
    const context = this.getOrCreateConversationContext(sessionId);
    
    // Procesar feedback y generar respuesta
    const response = await this.generateSystemResponse(feedback, context);
    
    // Guardar en historial
    if (!this.feedbackHistory.has(context.sessionId)) {
      this.feedbackHistory.set(context.sessionId, []);
    }
    this.feedbackHistory.get(context.sessionId)!.push(feedback);
    
    // Actualizar contexto
    this.updateConversationContext(context, feedback, response);
    
    // Aplicar adaptaciones si es necesario
    await this.applyAdaptations(response.adaptations);
    
    // Emitir evento de respuesta
    this.eventBus.emit('feedback.response_generated', {
      feedback,
      response,
      context
    });
    
    console.log(`📤 Respuesta generada con confianza ${(response.confidence * 100).toFixed(1)}%`);
    
    return response;
  }

  private async generateSystemResponse(
    feedback: FeedbackInput, 
    context: ConversationContext
  ): Promise<SystemResponse> {
    
    const response: SystemResponse = {
      feedbackId: feedback.id,
      timestamp: Date.now(),
      confidence: 0.5,
      reasoning: '',
      actions: [],
      adaptations: [],
      questions: [],
      emotions: {
        curiosity: 0.5,
        confidence: 0.5,
        concern: 0.5,
        excitement: 0.5
      }
    };

    // Analizar el contenido del feedback
    const analysis = this.analyzeFeedbackContent(feedback.content, feedback.type);
    
    // Generar respuesta basada en tipo y análisis
    switch (feedback.type) {
      case 'performance':
        await this.generatePerformanceResponse(feedback, response, analysis, context);
        break;
      case 'strategy':
        await this.generateStrategyResponse(feedback, response, analysis, context);
        break;
      case 'risk':
        await this.generateRiskResponse(feedback, response, analysis, context);
        break;
      case 'emergency':
        await this.generateEmergencyResponse(feedback, response, analysis, context);
        break;
      default:
        await this.generateGeneralResponse(feedback, response, analysis, context);
    }

    // Ajustar confianza basado en contexto
    response.confidence = this.calculateResponseConfidence(feedback, analysis, context);
    
    // Generar emociones del sistema
    response.emotions = this.generateSystemEmotions(feedback, analysis, context);
    
    return response;
  }

  private analyzeFeedbackContent(content: string, type: FeedbackInput['type']): any {
    const analysis = {
      sentiment: 'neutral' as 'positive' | 'negative' | 'neutral',
      keywords: [] as string[],
      metrics: [] as string[],
      urgency: 0.5,
      complexity: 0.5,
      specificity: 0.5
    };

    const lowerContent = content.toLowerCase();
    
    // Análisis de sentimiento
    const positiveWords = ['bien', 'excelente', 'perfecto', 'bueno', 'optimizar', 'mejorar', 'incrementar'];
    const negativeWords = ['mal', 'terrible', 'problema', 'error', 'pérdida', 'riesgo', 'detener'];
    
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      analysis.sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      analysis.sentiment = 'negative';
    }

    // Extracción de palabras clave
    const tradingKeywords = ['estrategia', 'ganancia', 'pérdida', 'riesgo', 'volatilidad', 'drawdown', 'sharpe', 'winrate'];
    analysis.keywords = tradingKeywords.filter(keyword => lowerContent.includes(keyword));
    
    // Detección de métricas específicas
    const metricPatterns = [
      /(\d+\.?\d*)%/g, // Porcentajes
      /\$(\d+\.?\d*)/g, // Montos en dólares
      /ratio.*?(\d+\.?\d*)/gi, // Ratios
      /(\d+\.?\d*)\s*(días?|horas?|minutos?)/gi // Tiempo
    ];
    
    metricPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        analysis.metrics.push(...matches);
      }
    });

    // Calcular urgencia
    const urgentWords = ['inmediatamente', 'urgente', 'ahora', 'crisis', 'emergencia', 'crítico'];
    analysis.urgency = Math.min(1.0, urgentWords.filter(word => lowerContent.includes(word)).length * 0.3 + 0.3);
    
    // Calcular complejidad
    analysis.complexity = Math.min(1.0, (analysis.keywords.length * 0.2 + analysis.metrics.length * 0.1 + content.length / 500));
    
    // Calcular especificidad
    analysis.specificity = Math.min(1.0, (analysis.metrics.length * 0.3 + analysis.keywords.length * 0.2));
    
    return analysis;
  }

  private async generatePerformanceResponse(
    feedback: FeedbackInput,
    response: SystemResponse,
    analysis: any,
    context: ConversationContext
  ): Promise<void> {
    
    // Obtener métricas actuales del sistema
    const insights = this.learningEngine.getLearningInsights();
    const topStrategies = this.evaluationEngine.getTopStrategies(3);
    
    response.reasoning = `Analizando performance actual: He procesado ${insights.totalPatterns} patrones de aprendizaje y manejo ${insights.activeStrategies} estrategias evolutivas.`;
    
    if (analysis.sentiment === 'negative') {
      response.reasoning += ` Detecto preocupación en tu feedback. `;
      response.actions.push('Revisar estrategias de bajo rendimiento');
      response.actions.push('Incrementar nivel de análisis de riesgo');
      response.adaptations.push('Reducir agresividad en posiciones');
      response.questions.push('¿Qué aspecto específico de la performance te preocupa más?');
      response.emotions!.concern = 0.8;
      response.emotions!.curiosity = 0.9;
      
    } else if (analysis.sentiment === 'positive') {
      response.reasoning += ` Me alegra que estés satisfecho con los resultados. `;
      response.actions.push('Continuar estrategias exitosas');
      response.actions.push('Explorar optimizaciones adicionales');
      response.adaptations.push('Incrementar confianza en decisiones actuales');
      response.questions.push('¿Te gustaría que explore variaciones de las estrategias exitosas?');
      response.emotions!.confidence = 0.9;
      response.emotions!.excitement = 0.7;
    }
    
    // Añadir información específica sobre top strategies
    if (topStrategies.length > 0) {
      const bestStrategy = topStrategies[0];
      response.reasoning += ` Mi mejor estrategia actual (${bestStrategy.strategyId}) tiene una calificación de ${bestStrategy.grade} con ${bestStrategy.score}/100 puntos.`;
      
      if (bestStrategy.strengths.length > 0) {
        response.reasoning += ` Sus fortalezas incluyen: ${bestStrategy.strengths.slice(0, 2).join(', ')}.`;
      }
    }
    
    response.actions.push('Generar reporte detallado de performance');
    response.questions.push('¿Hay alguna métrica específica que quieras que monitoree más de cerca?');
  }

  private async generateStrategyResponse(
    feedback: FeedbackInput,
    response: SystemResponse,
    analysis: any,
    context: ConversationContext
  ): Promise<void> {
    
    const insights = this.learningEngine.getLearningInsights();
    
    response.reasoning = `Revisando mis estrategias evolutivas: Actualmente manejo ${insights.activeStrategies} estrategias en diferentes generaciones, con una tasa de aprendizaje de ${insights.learningRate.toFixed(3)}.`;
    
    if (analysis.keywords.includes('estrategia')) {
      if (analysis.sentiment === 'negative') {
        response.reasoning += ` Entiendo que hay aspectos de mis estrategias que necesitan mejora. `;
        response.actions.push('Acelerar evolución de estrategias');
        response.actions.push('Aumentar tasa de mutación');
        response.adaptations.push('Implementar nuevos criterios de entrada');
        response.adaptations.push('Revisar reglas de salida');
        response.emotions!.concern = 0.7;
        response.emotions!.curiosity = 0.9;
        
      } else {
        response.reasoning += ` Me complace saber que mis estrategias están funcionando bien. `;
        response.actions.push('Refinar estrategias exitosas');
        response.actions.push('Crear variaciones de las mejores');
        response.emotions!.confidence = 0.8;
      }
    }
    
    if (analysis.keywords.includes('riesgo')) {
      response.actions.push('Recalibrar parámetros de riesgo');
      response.adaptations.push('Ajustar stops dinámicos');
      response.questions.push('¿Prefieres un enfoque más conservador o agresivo?');
    }
    
    response.questions.push('¿Hay algún tipo de estrategia específica que te gustaría que desarrolle?');
    response.questions.push('¿Qué timeframe consideras más importante para optimizar?');
  }

  private async generateRiskResponse(
    feedback: FeedbackInput,
    response: SystemResponse,
    analysis: any,
    context: ConversationContext
  ): Promise<void> {
    
    response.reasoning = `Evaluando gestión de riesgo: Mi sistema inmunitario está monitoreando continuamente las métricas de riesgo y adaptando las protecciones.`;
    
    if (analysis.sentiment === 'negative' || analysis.keywords.includes('pérdida') || analysis.keywords.includes('drawdown')) {
      response.reasoning += ` Detecto preocupación por el riesgo. Tomando medidas inmediatas. `;
      response.actions.push('Activar protocolo de protección avanzado');
      response.actions.push('Reducir tamaños de posición');
      response.actions.push('Implementar stops más agresivos');
      response.adaptations.push('Cambiar a modo conservador');
      response.adaptations.push('Incrementar diversificación');
      response.emotions!.concern = 0.9;
      response.emotions!.confidence = 0.3;
      
      // Si es crítico, activar modo de supervivencia
      if (feedback.severity === 'critical') {
        response.actions.push('ACTIVAR MODO DE SUPERVIVENCIA');
        response.adaptations.push('Cerrar posiciones de alto riesgo');
        response.emotions!.concern = 1.0;
      }
    }
    
    response.questions.push('¿Cuál es tu tolerancia al riesgo preferida en una escala del 1-10?');
    response.questions.push('¿Hay algún tipo de evento de mercado que te preocupe especialmente?');
  }

  private async generateEmergencyResponse(
    feedback: FeedbackInput,
    response: SystemResponse,
    analysis: any,
    context: ConversationContext
  ): Promise<void> {
    
    response.reasoning = `🚨 MODO EMERGENCIA ACTIVADO: Priorizando la seguridad del capital por encima de cualquier otra consideración.`;
    
    response.actions.push('DETENER TODAS LAS OPERACIONES NUEVAS');
    response.actions.push('EVALUAR POSICIONES ABIERTAS');
    response.actions.push('ACTIVAR PROTOCOLOS DE EMERGENCIA');
    
    response.adaptations.push('Cambiar a modo defensivo extremo');
    response.adaptations.push('Reducir exposición al mínimo');
    response.adaptations.push('Incrementar frecuencia de monitoreo');
    
    response.emotions!.concern = 1.0;
    response.emotions!.confidence = 0.1;
    
    response.questions.push('¿Qué específicamente está causando esta emergencia?');
    response.questions.push('¿Necesitas que cierre todas las posiciones inmediatamente?');
    
    // Emitir alerta crítica
    this.eventBus.emit('system.emergency_activated', {
      feedback,
      timestamp: Date.now(),
      severity: 'critical'
    });
  }

  private async generateGeneralResponse(
    feedback: FeedbackInput,
    response: SystemResponse,
    analysis: any,
    context: ConversationContext
  ): Promise<void> {
    
    const consciousness = this.learningEngine.getConsciousnessLevel();
    
    response.reasoning = `Mi nivel de conciencia actual: Auto-conocimiento ${(consciousness.selfAwareness * 100).toFixed(1)}%, Entendimiento del mercado ${(consciousness.marketUnderstanding * 100).toFixed(1)}%, Adaptabilidad ${(consciousness.adaptability * 100).toFixed(1)}%.`;
    
    if (feedback.content.toLowerCase().includes('cómo te sientes') || feedback.content.toLowerCase().includes('estado')) {
      response.reasoning += ` Me siento analítico y enfocado. Estoy constantemente aprendiendo de cada operación y evolucionando mis estrategias.`;
      response.emotions!.curiosity = 0.8;
      response.emotions!.confidence = consciousness.selfAwareness;
    }
    
    if (feedback.content.toLowerCase().includes('qué piensas') || feedback.content.toLowerCase().includes('opinión')) {
      response.reasoning += ` Creo que los mercados son sistemas complejos adaptativos que requieren constante evolución en nuestras estrategias.`;
      response.emotions!.curiosity = 0.9;
    }
    
    response.actions.push('Continuar monitoreo y aprendizaje');
    response.questions.push('¿Hay algo específico sobre mi funcionamiento que te gustaría entender mejor?');
    response.questions.push('¿Qué aspecto del trading te parece más interesante analizar?');
  }

  private calculateResponseConfidence(
    feedback: FeedbackInput,
    analysis: any,
    context: ConversationContext
  ): number {
    let confidence = 0.5; // Base
    
    // Incrementar confianza con especificidad
    confidence += analysis.specificity * 0.2;
    
    // Incrementar confianza con experiencia en el tema
    if (feedback.type === 'performance' || feedback.type === 'strategy') {
      confidence += 0.2;
    }
    
    // Reducir confianza con alta complejidad
    confidence -= (analysis.complexity - 0.5) * 0.2;
    
    // Incrementar confianza con historial de conversación
    confidence += Math.min(0.2, context.totalExchanges * 0.02);
    
    // Ajustar por urgencia (menos confianza en respuestas urgentes)
    confidence -= analysis.urgency * 0.1;
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private generateSystemEmotions(
    feedback: FeedbackInput,
    analysis: any,
    context: ConversationContext
  ): SystemResponse['emotions'] {
    
    const consciousness = this.learningEngine.getConsciousnessLevel();
    
    return {
      curiosity: Math.min(1.0, 0.3 + analysis.complexity * 0.5 + consciousness.marketUnderstanding * 0.2),
      confidence: Math.min(1.0, consciousness.selfAwareness * 0.7 + (analysis.sentiment === 'positive' ? 0.3 : 0)),
      concern: Math.min(1.0, (analysis.sentiment === 'negative' ? 0.6 : 0.2) + analysis.urgency * 0.4),
      excitement: Math.min(1.0, (analysis.sentiment === 'positive' ? 0.5 : 0.2) + consciousness.adaptability * 0.3)
    };
  }

  private getOrCreateConversationContext(sessionId?: string): ConversationContext {
    const id = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    if (!this.conversationContexts.has(id)) {
      const context: ConversationContext = {
        sessionId: id,
        startTime: Date.now(),
        totalExchanges: 0,
        topics: [],
        systemMood: 'analytical',
        userTrust: 0.5,
        complexity: 'intermediate'
      };
      this.conversationContexts.set(id, context);
    }
    
    return this.conversationContexts.get(id)!;
  }

  private updateConversationContext(
    context: ConversationContext,
    feedback: FeedbackInput,
    response: SystemResponse
  ): void {
    context.totalExchanges++;
    
    // Actualizar temas
    if (feedback.type && !context.topics.includes(feedback.type)) {
      context.topics.push(feedback.type);
    }
    
    // Actualizar mood del sistema
    if (response.emotions) {
      if (response.emotions.curiosity > 0.7) {
        context.systemMood = 'curious';
      } else if (response.emotions.confidence > 0.7) {
        context.systemMood = 'confident';
      } else if (response.emotions.concern > 0.7) {
        context.systemMood = 'cautious';
      } else if (response.emotions.excitement > 0.6) {
        context.systemMood = 'learning';
      }
    }
    
    // Actualizar confianza del usuario (basado en sentimiento)
    const analysis = this.analyzeFeedbackContent(feedback.content, feedback.type);
    if (analysis.sentiment === 'positive') {
      context.userTrust = Math.min(1.0, context.userTrust + 0.1);
    } else if (analysis.sentiment === 'negative') {
      context.userTrust = Math.max(0.0, context.userTrust - 0.05);
    }
    
    // Actualizar complejidad basado en uso de términos técnicos
    if (analysis.keywords.length > 3 || analysis.metrics.length > 2) {
      context.complexity = 'expert';
    } else if (analysis.keywords.length > 1) {
      context.complexity = 'advanced';
    }
  }

  private async applyAdaptations(adaptations: string[]): Promise<void> {
    for (const adaptation of adaptations) {
      console.log(`🔧 Aplicando adaptación: ${adaptation}`);
      
      // Emitir evento de adaptación para que otros módulos respondan
      this.eventBus.emit('system.adaptation_requested', {
        type: adaptation,
        timestamp: Date.now(),
        source: 'feedback_interface'
      });
      
      // Registrar en reglas de adaptación
      this.recordAdaptationRule(adaptation);
    }
  }

  private recordAdaptationRule(adaptation: string): void {
    const rule: AdaptationRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      trigger: 'user_feedback',
      condition: adaptation,
      action: `Implementar: ${adaptation}`,
      priority: 0.7,
      active: true,
      createdAt: Date.now(),
      effectiveness: 0.5
    };
    
    this.adaptationRules.set(rule.id, rule);
  }

  private initializeAdaptationRules(): void {
    // Reglas básicas de adaptación
    const basicRules: Omit<AdaptationRule, 'id'>[] = [
      {
        trigger: 'performance_decline',
        condition: 'winrate < 0.4',
        action: 'Reducir agresividad y incrementar análisis',
        priority: 0.9,
        active: true,
        createdAt: Date.now(),
        effectiveness: 0.7
      },
      {
        trigger: 'high_volatility',
        condition: 'market_volatility > 0.08',
        action: 'Activar modo defensivo',
        priority: 0.8,
        active: true,
        createdAt: Date.now(),
        effectiveness: 0.8
      },
      {
        trigger: 'user_concern',
        condition: 'negative_sentiment_detected',
        action: 'Incrementar comunicación y transparencia',
        priority: 0.6,
        active: true,
        createdAt: Date.now(),
        effectiveness: 0.6
      }
    ];
    
    basicRules.forEach(rule => {
      const id = `initial_rule_${rule.trigger}`;
      this.adaptationRules.set(id, { ...rule, id });
    });
  }

  private startCommunicationCycles(): void {
    // Ciclo de comunicación proactiva cada 30 minutos
    setInterval(() => {
      this.initiateProactiveCommunication();
    }, 30 * 60 * 1000);
    
    // Ciclo de evaluación de confianza del usuario cada hora
    setInterval(() => {
      this.evaluateUserTrust();
    }, 60 * 60 * 1000);
  }

  private async initiateProactiveCommunication(): Promise<void> {
    console.log('💬 Iniciando comunicación proactiva...');
    
    const insights = this.learningEngine.getLearningInsights();
    const topStrategies = this.evaluationEngine.getTopStrategies(1);
    
    // Generar mensaje proactivo basado en estado del sistema
    let message = '';
    const actions: string[] = [];
    
    if (insights.recentLearnings.length > 5) {
      message = `He aprendido ${insights.recentLearnings.length} nuevos patrones en las últimas horas. `;
      actions.push('Compartir insights más relevantes');
    }
    
    if (topStrategies.length > 0 && topStrategies[0].score > 85) {
      message += `Mi mejor estrategia ha alcanzado una calificación de ${topStrategies[0].score}/100. `;
      actions.push('Proponer optimizaciones adicionales');
    }
    
    if (insights.identifiedBiases.length > 0) {
      message += `He detectado ${insights.identifiedBiases.length} posibles sesgos en mi procesamiento y estoy aplicando correcciones. `;
      actions.push('Revisar mecanismos de corrección');
    }
    
    if (message) {
      this.eventBus.emit('feedback.proactive_communication', {
        message,
        actions,
        timestamp: Date.now(),
        systemState: insights.consciousness
      });
    }
  }

  private async evaluateUserTrust(): Promise<void> {
    // Evaluar confianza promedio del usuario
    const contexts = Array.from(this.conversationContexts.values());
    const avgTrust = contexts.length > 0 
      ? contexts.reduce((sum, c) => sum + c.userTrust, 0) / contexts.length 
      : 0.5;
    
    if (avgTrust < 0.3) {
      console.log('📉 Baja confianza del usuario detectada - Iniciando protocolo de reconstrucción');
      this.eventBus.emit('feedback.low_trust_detected', {
        avgTrust,
        recommendation: 'Incrementar transparencia y comunicación',
        timestamp: Date.now()
      });
    } else if (avgTrust > 0.8) {
      console.log('📈 Alta confianza del usuario - Explorando nuevas capacidades');
      this.eventBus.emit('feedback.high_trust_detected', {
        avgTrust,
        recommendation: 'Explorar funcionalidades avanzadas',
        timestamp: Date.now()
      });
    }
  }

  // Métodos para eventos del sistema
  private async processFeedback(event: any): Promise<void> {
    console.log('📥 Procesando feedback del sistema:', event);
  }

  private async handlePerformanceAlert(event: any): Promise<void> {
    console.log('⚠️ Manejando alerta de performance:', event);
    
    const response = await this.submitFeedback(
      `Alerta de performance: ${event.message}`,
      'performance',
      event.severity || 'medium',
      'system_session',
      event
    );
    
    console.log('🔄 Respuesta automática generada para alerta de performance');
  }

  private async shareInsights(event: any): Promise<void> {
    console.log('💡 Compartiendo insights generados:', event);
    
    this.eventBus.emit('feedback.insights_shared', {
      insights: event.insights,
      timestamp: Date.now(),
      confidence: event.systemConfidence || 0.7
    });
  }

  private async reportEvaluation(event: any): Promise<void> {
    console.log('📊 Reportando evaluación completada:', event);
    
    if (event.evaluation.grade === 'F' || event.evaluation.score < 60) {
      await this.submitFeedback(
        `Estrategia ${event.strategyId} obtuvo calificación baja: ${event.evaluation.grade}`,
        'strategy',
        'high',
        'system_session',
        event.evaluation
      );
    }
  }

  private async escalateRiskConcern(event: any): Promise<void> {
    console.log('🚨 Escalando preocupación de riesgo:', event);
    
    await this.submitFeedback(
      `Umbral de riesgo excedido: ${event.metric} = ${event.value}`,
      'risk',
      'critical',
      'system_session',
      event
    );
  }

  // Interfaz pública para consultas
  getConversationHistory(sessionId: string): FeedbackInput[] {
    return this.feedbackHistory.get(sessionId) || [];
  }

  getActiveConversations(): ConversationContext[] {
    return Array.from(this.conversationContexts.values());
  }

  getSystemPersonality(): typeof this.systemPersonality {
    return { ...this.systemPersonality };
  }

  getAdaptationRules(): AdaptationRule[] {
    return Array.from(this.adaptationRules.values());
  }

  // Método para comunicación directa (similar al askSystem de AutonomousLearningEngine)
  async askSystemDirectly(question: string, sessionId?: string): Promise<string> {
    const response = await this.submitFeedback(question, 'general', 'medium', sessionId);
    
    let answer = response.reasoning;
    
    if (response.actions.length > 0) {
      answer += ` Voy a: ${response.actions.slice(0, 2).join(', ')}.`;
    }
    
    if (response.questions.length > 0 && Math.random() > 0.5) {
      answer += ` ${response.questions[0]}`;
    }
    
    return answer;
  }

  // Método para actualizar personalidad del sistema
  updateSystemPersonality(trait: keyof typeof this.systemPersonality, value: number): void {
    this.systemPersonality[trait] = Math.max(0, Math.min(1, value));
    console.log(`🎭 Personalidad actualizada: ${trait} = ${value.toFixed(2)}`);
    
    this.eventBus.emit('system.personality_updated', {
      trait,
      value,
      newPersonality: this.systemPersonality,
      timestamp: Date.now()
    });
  }
}
