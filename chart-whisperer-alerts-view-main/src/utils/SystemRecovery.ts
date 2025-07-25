// 🔄 SISTEMA DE RECUPERACIÓN - Limpieza y Reinicio
export class SystemRecovery {
  static clearWebSocketConnections(): void {
    console.log('🧹 Limpiando conexiones WebSocket...');
    
    // Cerrar todas las conexiones WebSocket abiertas
    const websockets = Array.from(document.querySelectorAll('*'))
      .map((el: any) => el.websocket)
      .filter(Boolean);
    
    websockets.forEach((ws: WebSocket) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
  }

  static clearEventListeners(): void {
    console.log('🧹 Limpiando event listeners...');
    
    // Limpiar timers globales
    const highestTimeoutId = setTimeout(";", 9999);
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
    }

    const highestIntervalId = setInterval(";", 9999);
    for (let i = 0; i < highestIntervalId; i++) {
      clearInterval(i);
    }
  }

  static resetLocalStorage(): void {
    console.log('🧹 Limpiando localStorage...');
    
    // Mantener solo datos críticos
    const criticalKeys = ['theme', 'user-preferences'];
    const tempData: { [key: string]: string } = {};
    
    criticalKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) tempData[key] = value;
    });
    
    localStorage.clear();
    
    Object.entries(tempData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  }

  static performFullRecovery(): void {
    console.log('🔄 Iniciando recuperación completa del sistema...');
    
    try {
      this.clearWebSocketConnections();
      this.clearEventListeners();
      this.resetLocalStorage();
      
      console.log('✅ Recuperación completa exitosa');
      
      // Recargar la aplicación limpiamente
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error durante recuperación:', error);
      
      // Último recurso: hard reload
      window.location.href = window.location.href;
    }
  }

  static createRecoveryButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.innerHTML = '🔄 Recuperar Sistema';
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      background: #ef4444;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    button.onclick = () => this.performFullRecovery();
    
    return button;
  }

  static monitorSystemHealth(): void {
    // Detectar errores React y mostrar botón de recuperación
    window.addEventListener('error', (event) => {
      console.error('🚨 Error detectado:', event.error);
      
      if (event.error?.message?.includes('insertBefore') || 
          event.error?.message?.includes('Node')) {
        
        const existingButton = document.getElementById('recovery-button');
        if (!existingButton) {
          const recoveryButton = this.createRecoveryButton();
          recoveryButton.id = 'recovery-button';
          document.body.appendChild(recoveryButton);
        }
      }
    });

    // Detectar errores no manejados de React
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Promise rejection no manejada:', event.reason);
    });
  }
}

// Inicializar monitoreo automáticamente
if (typeof window !== 'undefined') {
  SystemRecovery.monitorSystemHealth();
}
