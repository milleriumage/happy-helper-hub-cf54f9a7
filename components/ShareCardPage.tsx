import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { AI_MODELS } from './CardsSection';

interface CardData {
  id: string;
  theme: string;
  personality: string;
  personality_emoji: string;
  voice: string;
  duration_minutes: number;
  gradient_from: string;
  gradient_to: string;
  created_at: string;
  name?: string;
  catchPhrase?: string;
}

export const ShareCardPage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);

  useEffect(() => {
    const fetchCard = async () => {
      if (!shareId) {
        setError('ID do card não encontrado');
        setLoading(false);
        return;
      }

      // Primeiro, verificar se é um card pré-definido (modelo)
      const predefinedModel = AI_MODELS.find(m => m.id === shareId);
      if (predefinedModel) {
        setCardData({
          id: predefinedModel.id,
          theme: predefinedModel.theme,
          personality: predefinedModel.personality,
          personality_emoji: predefinedModel.personalityEmoji,
          voice: predefinedModel.voice || 'Kore',
          duration_minutes: Math.ceil(predefinedModel.durationSeconds / 60),
          gradient_from: predefinedModel.gradientFrom,
          gradient_to: predefinedModel.gradientTo,
          created_at: new Date().toISOString(),
          name: predefinedModel.name,
          catchPhrase: predefinedModel.catchPhrase
        });
        setLoading(false);
        return;
      }

      // Se não for pré-definido, buscar no banco
      try {
        const { data, error: fetchError } = await supabase
          .from('user_cards')
          .select('*')
          .eq('share_id', shareId)
          .maybeSingle();

        if (fetchError) throw fetchError;
        
        if (!data) {
          setError('Card não encontrado');
        } else {
          setCardData(data);
        }
      } catch (e: any) {
        console.error('Erro ao buscar card:', e);
        setError('Erro ao carregar o card');
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-rose-50 to-red-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !cardData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-rose-50 to-red-100 flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">😢</div>
        <h1 className="text-2xl font-black text-rose-500 mb-2">Ops!</h1>
        <p className="text-rose-400 mb-6">{error || 'Card não encontrado'}</p>
        <Link 
          to="/"
          className="px-6 py-3 bg-gradient-to-r from-orange-400 to-rose-500 text-white font-bold rounded-full"
        >
          Voltar ao Início
        </Link>
      </div>
    );
  }

  const personalityLabel = {
    sarcastico: 'Sarcástico',
    furioso: 'Furioso',
    engracado: 'Engraçado',
    dramatico: 'Dramático'
  }[cardData.personality] || cardData.personality;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-rose-50 to-red-100 flex flex-col">
      {/* Header */}
      <div className="py-6 text-center">
        <h1 
          className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500"
          style={{ fontFamily: 'cursive' }}
        >
          DR.ia
        </h1>
        <p className="text-rose-400 text-sm mt-1">Seu Simulado de Treta</p>
      </div>

      {/* Card Preview */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${cardData.gradient_from}, ${cardData.gradient_to})`,
          }}
        >
          {/* Card Header */}
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">{cardData.personality_emoji}</div>
            <h2 className="text-white text-2xl font-black mb-2">
              {cardData.name || 'Treta Pronta!'}
            </h2>
            <p className="text-white/80 text-sm">
              {cardData.name ? 'Entre no ringue com esse personagem!' : 'Alguém criou um card de barraco pra você!'}
            </p>
          </div>

          {/* Card Content */}
          <div className="bg-white/20 backdrop-blur-sm mx-4 mb-4 p-4 rounded-2xl">
            <div className="mb-3">
              <p className="text-white/60 text-[10px] font-bold uppercase">
                {cardData.catchPhrase ? 'Frase de Efeito:' : 'Motivo do Barraco:'}
              </p>
              <p className="text-white font-bold text-lg leading-tight">
                "{cardData.catchPhrase || cardData.theme}"
              </p>
            </div>
            
            <div className="flex justify-between text-center">
              <div>
                <p className="text-white/60 text-[10px] font-bold uppercase">Personalidade</p>
                <p className="text-white font-bold text-sm">{personalityLabel}</p>
              </div>
              <div>
                <p className="text-white/60 text-[10px] font-bold uppercase">Duração</p>
                <p className="text-white font-bold text-sm">{cardData.duration_minutes} min</p>
              </div>
              <div>
                <p className="text-white/60 text-[10px] font-bold uppercase">Voz</p>
                <p className="text-white font-bold text-sm">{cardData.voice === 'Kore' ? '👩 Fem' : '👨 Masc'}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="p-4 pt-0">
            <p className="text-white/80 text-center text-sm mb-3">
              Entre na plataforma e experimente esse barraco!
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        <Link 
          to="/?mode=login"
          className="block w-full py-4 rounded-2xl bg-gradient-to-r from-orange-400 via-rose-500 to-red-500 text-white font-black text-center uppercase tracking-wide shadow-lg"
        >
          🔥 Entrar e Experimentar
        </Link>
        
        <Link 
          to="/?mode=register"
          className="block w-full py-3 rounded-2xl bg-white/80 text-rose-500 font-bold text-center border-2 border-rose-300"
        >
          Criar Minha Conta
        </Link>
        
        <p className="text-center text-rose-400 text-xs mt-4">
          Crie seus próprios barracos e compartilhe com amigos!
        </p>
      </div>
    </div>
  );
};
