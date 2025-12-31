import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d6407d99ef1d42cdafe72c6379794c8e',
  appName: 'Vision AI Social',
  webDir: 'dist',
  server: {
    url: 'https://d6407d99-ef1d-42cd-afe7-2c6379794c8e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    // Permissões de câmera e microfone para WebView
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    // Configurações para iOS WebView
    allowsLinkPreview: false
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen'
    }
  }
};

export default config;
