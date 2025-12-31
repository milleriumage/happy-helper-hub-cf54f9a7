import React, { useState } from 'react';
import { supabase } from '../supabase';

interface ConfigSectionProps {
  onStartSession: (config: { duration: number; theme: string; personality: string; voice: string; language: string }) => void;
  userId?: string;
  onCardGenerated?: () => void;
}

const personalities = [
  { id: 'sarcastico', label: 'Sarcástico', emoji: '🙄' },
  { id: 'furioso', label: 'Furioso', emoji: '🤬' },
  { id: 'engracado', label: 'Engraçado', emoji: '🤣' },
  { id: 'dramatico', label: 'Dramático', emoji: '🥺' },
];

const voices = [
  { id: 'Kore', label: 'Feminina', emoji: '👩' },
  { id: 'Puck', label: 'Masculina', emoji: '👨' },
];

const languages = [
  { id: 'pt-BR', label: 'PT', flag: 'BR' },
];

export const ConfigSection: React.FC<ConfigSectionProps> = ({ onStartSession, userId, onCardGenerated }) => {
  const [duration, setDuration] = useState(3);
  const [theme, setTheme] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState('sarcastico');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');
  const [generatingCard, setGeneratingCard] = useState(false);

  const handleStart = () => {
    if (!theme.trim()) {
      alert('Por favor, insira o motivo do barraco!');
      return;
    }
    onStartSession({
      duration,
      theme,
      personality: selectedPersonality,
      voice: selectedVoice,
      language: selectedLanguage,
    });
  };

  const handleGenerateCard = async () => {
    if (!theme.trim()) {
      alert('Por favor, insira o motivo do barraco!');
      return;
    }
    if (!userId) {
      alert('Você precisa estar logado para gerar um card!');
      return;
    }

    setGeneratingCard(true);
    
    const personalityEmoji = selectedPersonality === 'sarcastico' ? '🙄' :
                            selectedPersonality === 'furioso' ? '🤬' :
                            selectedPersonality === 'engracado' ? '🤣' : '🥺';
    
    // Gradientes baseados na personalidade
    const gradients = {
      sarcastico: { from: '#059669', to: '#10b981' },
      furioso: { from: '#dc2626', to: '#ef4444' },
      engracado: { from: '#f97316', to: '#fb923c' },
      dramatico: { from: '#6b21a8', to: '#9333ea' }
    };
    
    const gradient = gradients[selectedPersonality as keyof typeof gradients] || gradients.sarcastico;

    try {
      const { data, error } = await supabase
        .from('user_cards')
        .insert({
          user_id: userId,
          theme: theme.trim(),
          personality: selectedPersonality,
          personality_emoji: personalityEmoji,
          voice: selectedVoice,
          duration_minutes: duration,
          gradient_from: gradient.from,
          gradient_to: gradient.to
        })
        .select('share_id')
        .single();

      if (error) throw error;

      // Copiar link para clipboard
      const shareUrl = `${window.location.origin}/card/${data.share_id}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'DR.ia - Minha Treta',
            text: `Venha experimentar: "${theme}"`,
            url: shareUrl
          });
        } catch (e) {
          await navigator.clipboard.writeText(shareUrl);
          alert('Card criado! Link copiado para a área de transferência!');
        }
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Card criado! Link copiado para a área de transferência!');
      }

      // Limpar o tema após gerar
      setTheme('');
      onCardGenerated?.();
    } catch (e: any) {
      console.error('Erro ao gerar card:', e);
      alert('Erro ao gerar card. Tente novamente.');
    } finally {
      setGeneratingCard(false);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-orange-50 via-rose-50 to-red-100/60 p-4 sm:p-6 overflow-y-auto pb-24">
      <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500 mb-4 sm:mb-6">
        Configuração
      </h1>

      {/* Duration Slider */}
      <div className="mb-4">
        <label className="text-rose-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5 block">
          Duração (minutos)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="10"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="flex-1 h-1.5 bg-orange-200 rounded-full appearance-none cursor-pointer accent-rose-500"
          />
          <span className="text-rose-500 text-sm font-bold min-w-[40px] text-right">
            {duration} min
          </span>
        </div>
      </div>

      {/* Theme Input */}
      <div className="mb-4">
        <label className="text-rose-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5 block">
          Motivo do Barraco
        </label>
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="Ex: Ele esqueceu nosso aniversário..."
          className="w-full p-3 rounded-xl bg-white/90 border border-orange-200 text-rose-600 placeholder-rose-300 focus:outline-none focus:border-rose-400 text-sm"
        />
      </div>

      {/* Voice & Language Row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Voice Selection */}
        <div>
          <label className="text-rose-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5 block">
            Voz
          </label>
          <div className="flex gap-2">
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all text-xs ${
                  selectedVoice === voice.id
                    ? 'bg-gradient-to-r from-orange-400 to-rose-500 text-white shadow-sm'
                    : 'bg-white/70 text-rose-600 hover:bg-white'
                }`}
              >
                <span className="text-lg">{voice.emoji}</span>
                <span className="font-medium">{voice.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <label className="text-rose-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5 block">
            Idioma
          </label>
          <div className="flex gap-1.5">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`flex-1 py-2 px-1 rounded-xl transition-all text-xs font-semibold ${
                  selectedLanguage === lang.id
                    ? 'bg-gradient-to-r from-orange-400 to-rose-500 text-white shadow-sm'
                    : 'bg-white/70 text-rose-600 hover:bg-white'
                }`}
              >
                <div className="text-center">
                  <div className="text-[10px] opacity-70">{lang.flag}</div>
                  <div>{lang.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Personality Selection */}
      <div className="mb-4">
        <label className="text-rose-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5 block">
          Personalidade
        </label>
        <div className="grid grid-cols-2 gap-2">
          {personalities.map((personality) => (
            <button
              key={personality.id}
              onClick={() => setSelectedPersonality(personality.id)}
              className={`flex items-center gap-2 p-2.5 rounded-xl transition-all ${
                selectedPersonality === personality.id
                  ? 'bg-gradient-to-r from-orange-400 to-rose-500 text-white shadow-sm'
                  : 'bg-white/70 text-rose-600 hover:bg-white'
              }`}
            >
              <span className="text-xl">{personality.emoji}</span>
              <span className="font-semibold text-sm">{personality.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-400 via-rose-500 to-red-500 text-white font-bold text-sm uppercase tracking-wide shadow-md hover:shadow-lg hover:scale-[1.01] transition-all"
      >
        Entrar no Ringue
      </button>

      {/* Generate Card Button */}
      <button
        onClick={handleGenerateCard}
        disabled={generatingCard || !theme.trim()}
        className={`w-full py-3 mt-3 rounded-xl font-bold text-sm uppercase tracking-wide shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2 ${
          generatingCard || !theme.trim()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 text-white'
        }`}
      >
        {generatingCard ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <span>🎴</span>
            Gerar Card
          </>
        )}
      </button>
      
      <p className="text-center text-rose-400 text-[10px] mt-2">
        Gere um card para compartilhar com amigos!
      </p>
    </div>
  );
};
