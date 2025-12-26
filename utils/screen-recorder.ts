import { supabase } from '../supabase';

const ADMIN_EMAIL = 'exman9001@gmail.com';
const ONE_MINUTE_MS = 60 * 1000;

interface RecordingCallbacks {
  onOneMinuteSaved?: (recordingData: SavedRecording) => void;
  onFullSaved?: (recordingData: SavedRecording) => void;
}

export interface SavedRecording {
  id: string;
  file_path: string;
  file_name: string;
  share_id: string;
  duration_seconds: number;
  created_at: string;
  user_email: string;
}

class ScreenRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private oneMinuteChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecording = false;
  private userEmail: string = '';
  private userId: string = '';
  private recordingStartTime: number = 0;
  private oneMinuteSaved: boolean = false;
  private callbacks: RecordingCallbacks = {};

  // Detecta se é dispositivo móvel
  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);
  }

  async startRecording(userId: string, userEmail: string, callbacks?: RecordingCallbacks): Promise<boolean> {
    // No mobile, pular gravação de tela completamente
    if (this.isMobile()) {
      console.log('[SCREEN_RECORDER] Mobile detectado - gravação de tela desabilitada');
      return true; // Retorna sucesso sem bloquear
    }

    if (this.isRecording) {
      console.log('[SCREEN_RECORDER] Já está gravando');
      return true;
    }

    this.userId = userId;
    this.userEmail = userEmail;
    this.recordedChunks = [];
    this.oneMinuteChunks = [];
    this.oneMinuteSaved = false;
    this.recordingStartTime = Date.now();
    this.callbacks = callbacks || {};

    try {
      // Captura a tela + áudio do sistema (apenas desktop)
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      // Verifica suporte ao codec
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        videoBitsPerSecond: 2500000
      });

      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
          
          // Salvar primeiro minuto automaticamente
          const elapsed = Date.now() - this.recordingStartTime;
          if (!this.oneMinuteSaved && elapsed <= ONE_MINUTE_MS + 2000) {
            this.oneMinuteChunks.push(event.data);
          }
          
          // Quando passar de 1 minuto, salvar o clip do usuário
          if (!this.oneMinuteSaved && elapsed >= ONE_MINUTE_MS) {
            this.oneMinuteSaved = true;
            await this.saveOneMinuteClip();
          }
        }
      };

      this.mediaRecorder.onstop = () => {
        console.log('[SCREEN_RECORDER] Gravação parou, salvando completo...');
        this.saveFullRecording();
      };

      // Para gravação se o usuário parar de compartilhar
      this.stream.getVideoTracks()[0].onended = () => {
        console.log('[SCREEN_RECORDER] Usuário parou compartilhamento');
        this.stopRecording();
      };

      this.mediaRecorder.start(1000); // Chunks de 1 segundo
      this.isRecording = true;
      console.log('[SCREEN_RECORDER] Gravação iniciada');
      return true;
    } catch (error) {
      console.log('[SCREEN_RECORDER] Usuário cancelou ou erro:', error);
      return true; // Retorna true mesmo em erro para não bloquear a sessão
    }
  }

  async stopRecording(): Promise<void> {
    // No mobile, não há gravação para parar
    if (this.isMobile()) {
      console.log('[SCREEN_RECORDER] Mobile - nada para parar');
      return;
    }

    if (!this.isRecording || !this.mediaRecorder) {
      console.log('[SCREEN_RECORDER] Nada para parar');
      return;
    }

    console.log('[SCREEN_RECORDER] Parando gravação...');
    
    if (this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.isRecording = false;
  }

  private async saveOneMinuteClip(): Promise<void> {
    if (this.oneMinuteChunks.length === 0) {
      console.log('[SCREEN_RECORDER] Nenhum chunk de 1 minuto');
      return;
    }

    try {
      const blob = new Blob(this.oneMinuteChunks, { type: 'video/webm' });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `clip_1min_${timestamp}.webm`;
      const filePath = `${this.userEmail}/${fileName}`;

      console.log('[SCREEN_RECORDER] Salvando clip 1 min para usuário:', filePath, 'Tamanho:', (blob.size / 1024 / 1024).toFixed(2), 'MB');

      // Upload para storage do usuário (bucket recordings)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(filePath, blob, {
          contentType: 'video/webm',
          upsert: false
        });

      if (uploadError) {
        console.error('[SCREEN_RECORDER] Erro upload 1min:', uploadError);
        return;
      }

      // Registrar no banco de dados
      const { data: recording, error: dbError } = await supabase
        .from('recordings')
        .insert({
          user_id: this.userId,
          user_email: this.userEmail,
          file_path: filePath,
          file_name: fileName,
          duration_seconds: 60
        })
        .select()
        .single();

      if (dbError) {
        console.error('[SCREEN_RECORDER] Erro ao registrar no banco:', dbError);
        return;
      }

      console.log('[SCREEN_RECORDER] Clip 1min salvo:', recording);
      
      if (this.callbacks.onOneMinuteSaved && recording) {
        this.callbacks.onOneMinuteSaved(recording as SavedRecording);
      }
    } catch (error) {
      console.error('[SCREEN_RECORDER] Erro ao salvar clip 1min:', error);
    }
  }

  private async saveFullRecording(): Promise<void> {
    if (this.recordedChunks.length === 0) {
      console.log('[SCREEN_RECORDER] Nenhum dado para salvar');
      return;
    }

    try {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `full_session_${timestamp}.webm`;
      
      // Calcular duração em segundos
      const durationSeconds = Math.round((Date.now() - this.recordingStartTime) / 1000);
      
      // Salvar completo no storage do ADMIN (exman9001@gmail.com)
      const adminPath = `${ADMIN_EMAIL}/${this.userEmail}/${fileName}`;
      
      console.log('[SCREEN_RECORDER] Salvando vídeo completo para admin:', adminPath, 'Tamanho:', (blob.size / 1024 / 1024).toFixed(2), 'MB');

      const { error: adminUploadError } = await supabase.storage
        .from('session-recordings')
        .upload(adminPath, blob, {
          contentType: 'video/webm',
          upsert: false
        });

      if (adminUploadError) {
        console.error('[SCREEN_RECORDER] Erro ao salvar para admin:', adminUploadError);
        // Fallback: salvar localmente
        this.downloadLocally(blob, fileName);
      } else {
        console.log('[SCREEN_RECORDER] Vídeo completo salvo para admin com sucesso');
        
        if (this.callbacks.onFullSaved) {
          this.callbacks.onFullSaved({
            id: '',
            file_path: adminPath,
            file_name: fileName,
            share_id: '',
            duration_seconds: durationSeconds,
            created_at: new Date().toISOString(),
            user_email: this.userEmail
          });
        }
      }
    } catch (error) {
      console.error('[SCREEN_RECORDER] Erro:', error);
    } finally {
      this.recordedChunks = [];
      this.oneMinuteChunks = [];
    }
  }

  private downloadLocally(blob: Blob, fileName: string): void {
    // Fallback caso o storage falhe - salva localmente
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('[SCREEN_RECORDER] Salvo localmente:', fileName);
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }
}

// Singleton instance
export const screenRecorder = new ScreenRecorder();
