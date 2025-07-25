"""
🧠 RIVER ONLINE LEARNING ENGINE
Aprendizaje incremental en tiempo real sin reentrenamiento completo
Arquitectura simbiótica con Feast Feature Store
"""

import json
import pickle
import numpy as np
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import redis

# River imports
from river import (
    linear_model, 
    preprocessing, 
    metrics, 
    tree, 
    ensemble, 
    anomaly,
    drift,
    compose
)

@dataclass
class OnlinePrediction:
    """Resultado de una predicción online"""
    symbol: str
    prediction: float  # Valor predicho
    confidence: float  # Confianza de la predicción
    features: Dict[str, Any]  # Features utilizadas
    timestamp: int  # Unix timestamp
    model_type: str  # Tipo de modelo usado

@dataclass
class OnlineLearningMetrics:
    """Métricas del aprendizaje online"""
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    log_loss: float
    samples_seen: int
    drift_detected: bool
    last_update: datetime

class RiverOnlineLearningEngine:
    """
    Motor de aprendizaje online con River
    Aprende tick-by-tick sin reentrenamiento completo
    """
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        # Configuración
        self.redis_client = self._setup_redis(redis_url)
        self.models: Dict[str, Any] = {}  # Modelos por símbolo
        self.metrics: Dict[str, Dict[str, Any]] = {}  # Métricas por símbolo
        self.drift_detectors: Dict[str, Any] = {}  # Detectores de drift
        self.feature_scalers: Dict[str, Any] = {}  # Escaladores por símbolo
        
        # Configuración de modelos
        self.model_configs = {
            'regression': self._create_regression_model,
            'classification': self._create_classification_model,
            'anomaly': self._create_anomaly_model
        }
        
        print("🧠 River Online Learning Engine inicializado")
        self._initialize_models()

    def _setup_redis(self, redis_url: str) -> Optional[redis.Redis]:
        """Configurar conexión Redis para persistencia"""
        try:
            client = redis.from_url(redis_url)
            client.ping()
            print("✅ River: Conectado a Redis para persistencia")
            return client
        except Exception as e:
            print(f"⚠️ River: Redis no disponible, usando memoria: {e}")
            return None

    def _create_regression_model(self):
        """Crear modelo de regresión para predicción de precios"""
        return compose.Pipeline(
            preprocessing.StandardScaler(),
            linear_model.LinearRegression(
                l2=0.001
            )
        )

    def _create_classification_model(self):
        """Crear modelo de clasificación para dirección de precios"""
        return compose.Pipeline(
            preprocessing.StandardScaler(),
            tree.HoeffdingTreeClassifier(
                max_depth=6
            )
        )

    def _create_anomaly_model(self):
        """Crear modelo de detección de anomalías"""
        return anomaly.HalfSpaceTrees(
            n_trees=10,
            height=8,
            window_size=250
        )

    def _initialize_models(self):
        """Inicializar modelos para símbolos comunes"""
        common_symbols = ['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'SOL/USDT']
        
        for symbol in common_symbols:
            self._setup_symbol_models(symbol)

    def _setup_symbol_models(self, symbol: str):
        """Configurar modelos para un símbolo específico"""
        if symbol not in self.models:
            self.models[symbol] = {
                'price_regression': self._create_regression_model(),
                'direction_classification': self._create_classification_model(),
                'anomaly_detection': self._create_anomaly_model()
            }
            
            self.metrics[symbol] = {
                'regression': metrics.MAE(),
                'classification': metrics.Accuracy(),
                'precision': metrics.Precision(),
                'recall': metrics.Recall(),
                'f1': metrics.F1(),
                'log_loss': metrics.LogLoss()
            }
            
            self.drift_detectors[symbol] = drift.ADWIN(delta=0.002)
            self.feature_scalers[symbol] = preprocessing.StandardScaler()
            
            print(f"🎯 Modelos River configurados para {symbol}")

    def predict_one(self, symbol: str, features: Dict[str, Any]) -> OnlinePrediction:
        """
        Realizar predicción online para un tick
        """
        if symbol not in self.models:
            self._setup_symbol_models(symbol)
        
        try:
            # Preparar features
            feature_vector = self._prepare_features(features)
            
            # Predicción de precio (regresión)
            price_pred = self.models[symbol]['price_regression'].predict_one(feature_vector)
            
            # Predicción de dirección (clasificación)
            if hasattr(self.models[symbol]['direction_classification'], 'predict_proba_one'):
                direction_proba = self.models[symbol]['direction_classification'].predict_proba_one(feature_vector)
                direction_confidence = max(direction_proba.values()) if direction_proba else 0.5
            else:
                direction_confidence = 0.5
            
            # Detección de anomalías
            anomaly_score = self.models[symbol]['anomaly_detection'].score_one(feature_vector)
            
            # Combinar predicciones
            combined_prediction = price_pred if price_pred is not None else features.get('price', 0)
            combined_confidence = direction_confidence * (1 - min(anomaly_score, 0.5))
            
            return OnlinePrediction(
                symbol=symbol,
                prediction=float(combined_prediction),
                confidence=float(combined_confidence),
                features=features,
                timestamp=int(datetime.now().timestamp() * 1000),
                model_type='river_ensemble'
            )
            
        except Exception as e:
            print(f"❌ Error en predict_one para {symbol}: {e}")
            # Fallback prediction
            return OnlinePrediction(
                symbol=symbol,
                prediction=features.get('price', 0),
                confidence=0.5,
                features=features,
                timestamp=int(datetime.now().timestamp() * 1000),
                model_type='fallback'
            )

    def learn_one(self, symbol: str, features: Dict[str, Any], target: Dict[str, Any]):
        """
        Aprender de una observación (tick + resultado)
        """
        if symbol not in self.models:
            self._setup_symbol_models(symbol)
        
        try:
            # Preparar features
            feature_vector = self._prepare_features(features)
            
            # Aprender precio (regresión)
            if 'actual_price' in target:
                actual_price = target['actual_price']
                self.models[symbol]['price_regression'].learn_one(feature_vector, actual_price)
                
                # Actualizar métricas de regresión
                predicted_price = self.models[symbol]['price_regression'].predict_one(feature_vector)
                if predicted_price is not None:
                    self.metrics[symbol]['regression'].update(actual_price, predicted_price)
            
            # Aprender dirección (clasificación)
            if 'direction' in target:  # 1 = up, 0 = down
                direction = target['direction']
                self.models[symbol]['direction_classification'].learn_one(feature_vector, direction)
                
                # Actualizar métricas de clasificación
                pred_direction = self.models[symbol]['direction_classification'].predict_one(feature_vector)
                if pred_direction is not None:
                    self.metrics[symbol]['classification'].update(direction, pred_direction)
                    self.metrics[symbol]['precision'].update(direction, pred_direction)
                    self.metrics[symbol]['recall'].update(direction, pred_direction)
                    self.metrics[symbol]['f1'].update(direction, pred_direction)
            
            # Aprender anomalías
            self.models[symbol]['anomaly_detection'].learn_one(feature_vector)
            
            # Detectar drift
            if 'actual_price' in target:
                error = abs(target['actual_price'] - features.get('price', 0))
                self.drift_detectors[symbol].update(error)
            
            print(f"📚 River: Aprendizaje completado para {symbol}")
            
        except Exception as e:
            print(f"❌ Error en learn_one para {symbol}: {e}")

    def _prepare_features(self, features: Dict[str, Any]) -> Dict[str, float]:
        """Preparar y normalizar features para el modelo"""
        # Features numéricas básicas
        numeric_features = {}
        
        # Features de precio y volumen
        if 'price' in features:
            numeric_features['price'] = float(features['price'])
        if 'volume' in features:
            numeric_features['volume'] = float(features['volume'])
        
        # Features técnicas si están disponibles
        technical_features = [
            'rsi_14', 'rsi_21', 'macd_signal', 'macd_histogram',
            'bollinger_upper', 'bollinger_middle', 'bollinger_lower',
            'price_change_1m', 'price_change_5m', 'volume_ratio', 'volatility_index'
        ]
        
        for feature in technical_features:
            if feature in features and features[feature] is not None:
                numeric_features[feature] = float(features[feature])
        
        # Features categóricas (convertir a numéricas)
        if 'side' in features:
            numeric_features['side_numeric'] = 1.0 if features['side'] == 'buy' else 0.0
        
        # Features de tiempo
        if 'timestamp' in features:
            timestamp = features['timestamp']
            dt = datetime.fromtimestamp(timestamp / 1000)
            numeric_features['hour'] = float(dt.hour)
            numeric_features['minute'] = float(dt.minute)
            numeric_features['weekday'] = float(dt.weekday())
        
        return numeric_features

    def get_model_metrics(self, symbol: str) -> Optional[OnlineLearningMetrics]:
        """Obtener métricas actuales del modelo"""
        if symbol not in self.metrics:
            return None
        
        try:
            symbol_metrics = self.metrics[symbol]
            
            return OnlineLearningMetrics(
                accuracy=float(symbol_metrics['classification'].get()),
                precision=float(symbol_metrics['precision'].get()),
                recall=float(symbol_metrics['recall'].get()),
                f1_score=float(symbol_metrics['f1'].get()),
                log_loss=float(symbol_metrics.get('log_loss', {}).get() or 0),
                samples_seen=int(symbol_metrics['classification'].n),
                drift_detected=bool(self.drift_detectors[symbol].drift_detected),
                last_update=datetime.now()
            )
            
        except Exception as e:
            print(f"❌ Error obteniendo métricas para {symbol}: {e}")
            return None

    def save_model(self, symbol: str, filepath: str):
        """Guardar modelo en disco"""
        if symbol not in self.models:
            print(f"⚠️ No hay modelo para {symbol}")
            return
        
        try:
            model_data = {
                'models': self.models[symbol],
                'metrics': {k: v.get() for k, v in self.metrics[symbol].items()},
                'drift_detector': self.drift_detectors[symbol],
                'feature_scaler': self.feature_scalers[symbol],
                'timestamp': datetime.now().isoformat()
            }
            
            with open(filepath, 'wb') as f:
                pickle.dump(model_data, f)
            
            print(f"💾 Modelo River guardado: {filepath}")
            
        except Exception as e:
            print(f"❌ Error guardando modelo: {e}")

    def load_model(self, symbol: str, filepath: str):
        """Cargar modelo desde disco"""
        try:
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
            
            self.models[symbol] = model_data['models']
            self.drift_detectors[symbol] = model_data['drift_detector']
            self.feature_scalers[symbol] = model_data['feature_scaler']
            
            print(f"📂 Modelo River cargado: {filepath}")
            
        except Exception as e:
            print(f"❌ Error cargando modelo: {e}")
            # Si falla, crear modelos nuevos
            self._setup_symbol_models(symbol)

    def get_all_symbols_metrics(self) -> Dict[str, OnlineLearningMetrics]:
        """Obtener métricas de todos los símbolos"""
        all_metrics = {}
        
        for symbol in self.models.keys():
            metrics = self.get_model_metrics(symbol)
            if metrics:
                all_metrics[symbol] = metrics
        
        return all_metrics

    def reset_model(self, symbol: str):
        """Resetear modelo para un símbolo (útil después de drift severo)"""
        if symbol in self.models:
            print(f"🔄 Reseteando modelos River para {symbol}")
            self._setup_symbol_models(symbol)

    def get_feature_importance(self, symbol: str) -> Dict[str, float]:
        """Obtener importancia de features (si el modelo lo soporta)"""
        if symbol not in self.models:
            return {}
        
        try:
            # Para modelos que tienen coeficientes (regresión lineal)
            regression_model = self.models[symbol]['price_regression']
            if hasattr(regression_model, 'steps') and len(regression_model.steps) > 1:
                linear_reg = regression_model.steps[-1][1]  # Último paso del pipeline
                if hasattr(linear_reg, 'weights'):
                    return dict(linear_reg.weights)
            
            return {}
            
        except Exception as e:
            print(f"❌ Error obteniendo importancia de features: {e}")
            return {}

# Singleton instance
river_online_learning_engine = RiverOnlineLearningEngine()
