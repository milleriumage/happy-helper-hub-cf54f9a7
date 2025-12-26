import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';

export const SharePage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recordingInfo, setRecordingInfo] = useState<{
    file_name: string;
    created_at: string;
    user_email: string;
  } | null>(null);

  useEffect(() => {
    const fetchRecording = async () => {
      if (!shareId) {
        setError('Link inválido');
        setLoading(false);
        return;
      }

      // SEO básico
      document.title = 'DR.ia — Vídeo compartilhado';
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', 'Assista ao vídeo compartilhado no DR.ia e crie sua própria treta.');

      try {
        const { data, error: fnError } = await supabase.functions.invoke('get-shared-recording', {
          body: { shareId }
        });

        if (fnError || !data?.videoUrl) {
          console.error('[SHARE] Erro ao buscar gravação:', fnError || data);
          setError(data?.error || 'Gravação não encontrada');
          return;
        }

        setRecordingInfo(data.recording ?? null);
        setVideoUrl(data.videoUrl);
      } catch (e) {
        console.error('[SHARE] Erro:', e);
        setError('Erro ao carregar gravação');
      } finally {
        setLoading(false);
      }
    };

    fetchRecording();
  }, [shareId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5d0c5] via-[#e8c4d4] to-[#c9b3d4] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pink-500 font-medium">Carregando vídeo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5d0c5] via-[#e8c4d4] to-[#c9b3d4] flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <span className="text-6xl block mb-4">😢</span>
          <h1 className="text-2xl font-black text-pink-600 mb-2">Ops!</h1>
          <p className="text-pink-500 mb-6">{error}</p>
          <Link 
            to="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5d0c5] via-[#e8c4d4] to-[#c9b3d4] flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 
          className="text-4xl font-black italic text-pink-500 tracking-tighter drop-shadow-[0_0_15px_rgba(236,72,153,0.4)]"
          style={{ fontFamily: 'cursive' }}
        >
          DR.ia
        </h1>
        <p className="text-pink-400 text-[10px] uppercase font-black tracking-widest mt-1">
          - Seu Simulado de Treta -
        </p>
      </div>

      {/* Video Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 max-w-2xl w-full shadow-xl">
        {recordingInfo && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-xl">🎬</span>
            </div>
            <div>
              <p className="font-bold text-pink-600 text-sm">Sessão de Treta</p>
              <p className="text-pink-400 text-xs">{formatDate(recordingInfo.created_at)}</p>
            </div>
          </div>
        )}

        {/* Video Player */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              playsInline
              preload="auto"
              className="w-full h-full object-contain"
              onLoadedMetadata={(e) => {
                const video = e.currentTarget;
                video.muted = false;
                video.volume = 1;
              }}
            >
              <source src={videoUrl} type="video/webm" />
              <source src={videoUrl} type="video/mp4" />
              Seu navegador não suporta a reprodução de vídeo.
            </video>
          ) : (
            <div className="flex items-center justify-center h-full text-pink-300">
              <span>Vídeo não disponível</span>
            </div>
          )}
        </div>

        {/* Share info */}
        <div className="mt-4 text-center">
          <p className="text-pink-400 text-sm">
            Gostou? Entre agora e crie sua própria treta.
          </p>

          <div className="mt-3 flex flex-col sm:flex-row items-stretch justify-center gap-2">
            <Link
              to="/?mode=login"
              className="px-5 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-black rounded-xl hover:shadow-lg transition-all"
            >
              Entrar na cam agora
            </Link>
            <Link
              to="/?mode=register"
              className="px-5 py-3 bg-white/70 text-pink-600 font-black rounded-xl border border-pink-200 hover:shadow-lg transition-all"
            >
              Criar cadastro
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        to="/?mode=register"
        className="mt-6 px-8 py-4 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-black text-lg rounded-2xl shadow-lg shadow-pink-300/50 hover:shadow-xl hover:scale-105 transition-all"
      >
        CRIAR MINHA TRETA
      </Link>
    </div>
  );
};
