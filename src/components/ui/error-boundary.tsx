// 🛡️ ERROR BOUNDARY - Protección contra errores React
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Enviar error a sistema de monitoreo si está disponible
    if ((window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  public render() {
    if (this.state.hasError) {
      // Fallback UI personalizado
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-destructive rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-destructive mb-2">
              Error del Sistema
            </h2>
            <p className="text-muted-foreground mb-4">
              Algo salió mal con el componente de trading. El sistema se está recuperando...
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-muted p-3 rounded text-xs mb-4">
                <summary className="cursor-pointer font-medium mb-2">
                  Detalles del Error (Dev Mode)
                </summary>
                <pre className="whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              🔄 Recargar Sistema
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
