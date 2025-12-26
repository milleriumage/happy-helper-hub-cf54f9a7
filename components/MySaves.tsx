import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { SavedRecording } from '../utils/screen-recorder';

interface MySavesProps {
  userId: string;
  userEmail: string;
  newRecording?: SavedRecording | null;
}

export const MySaves: React.FC<MySavesProps> = ({ userId, userEmail, newRecording }) => {
  const [recordings, setRecordings] = useState<SavedRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[MYSAVES] Erro ao buscar gravações:', error);
        return;
      }

      setRecordings(data || []);
    } catch (e) {
      console.error('[MYSAVES] Erro:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRecordings();
    }
  }, [userId]);

  // Adicionar nova gravação quando chegar
  useEffect(() => {
    if (newRecording && newRecording.id) {
      setRecordings(prev => {
        // Evitar duplicatas
        if (prev.find(r => r.id === newRecording.id)) return prev;
        return [newRecording, ...prev];
      });
    }
  }, [newRecording]);

  const handleDelete = async (recording: SavedRecording) => {
    if (!confirm('Tem certeza que deseja excluir esta gravação?')) return;
    
    setDeletingId(recording.id);
    try {
      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('recordings')
        .remove([recording.file_path]);

      if (storageError) {
        console.error('[MYSAVES] Erro ao deletar do storage:', storageError);
      }

      // Deletar do banco
      const { error: dbError } = await supabase
        .from('recordings')
        .delete()
        .eq('id', recording.id);

      if (dbError) {
        console.error('[MYSAVES] Erro ao deletar do banco:', dbError);
        return;
      }

      setRecordings(prev => prev.filter(r => r.id !== recording.id));
    } catch (e) {
      console.error('[MYSAVES] Erro ao excluir:', e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleShare = async (recording: SavedRecording) => {
    const shareUrl = `${window.location.origin}/share/${recording.share_id}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(recording.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error('[MYSAVES] Erro ao copiar:', e);
      // Fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedId(recording.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleWatch = (recording: SavedRecording) => {
    // Obter URL pública do vídeo
    const { data } = supabase.storage
      .from('recordings')
      .getPublicUrl(recording.file_path);

    if (data?.publicUrl) {
      window.open(data.publicUrl, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pink-400 text-sm">Carregando gravações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📹</span>
          <div>
            <h2 className="text-xl font-black text-pink-600">Minhas Gravações</h2>
            <p className="text-pink-400 text-xs">Seus clipes de 1 minuto salvos automaticamente</p>
          </div>
        </div>

        {recordings.length === 0 ? (
          <div className="text-center py-12 bg-white/40 rounded-3xl border-2 border-dashed border-pink-200">
            <span className="text-5xl block mb-4">🎬</span>
            <h3 className="text-lg font-bold text-pink-500">Nenhuma gravação ainda</h3>
            <p className="text-pink-400 text-sm mt-2">
              Quando você jogar, o primeiro minuto será salvo aqui!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {recordings.map((recording) => (
              <div 
                key={recording.id}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-pink-100 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Thumbnail/Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-2xl">🎥</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-pink-600 truncate">
                      Sessão {formatDate(recording.created_at)}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-pink-400">
                      <span className="flex items-center gap-1">
                        <span>⏱️</span>
                        {formatDuration(recording.duration_seconds)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Watch */}
                    <button
                      onClick={() => handleWatch(recording)}
                      className="p-2 bg-pink-100 hover:bg-pink-200 rounded-xl transition-all"
                      title="Assistir"
                    >
                      <span className="text-lg">▶️</span>
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => handleShare(recording)}
                      className={`p-2 rounded-xl transition-all ${
                        copiedId === recording.id 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-blue-100 hover:bg-blue-200'
                      }`}
                      title="Copiar link"
                    >
                      <span className="text-lg">{copiedId === recording.id ? '✅' : '🔗'}</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(recording)}
                      disabled={deletingId === recording.id}
                      className="p-2 bg-red-100 hover:bg-red-200 rounded-xl transition-all disabled:opacity-50"
                      title="Excluir"
                    >
                      <span className="text-lg">{deletingId === recording.id ? '⏳' : '🗑️'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
