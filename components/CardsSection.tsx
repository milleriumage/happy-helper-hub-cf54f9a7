import React, { useState, useEffect } from 'react';
import { AICard, AIModel } from './AICard';
import { supabase } from '../supabase';

const maleAvatar = '/src/assets/male-avatar.png';
const femaleAvatar = '/src/assets/ai-avatar.png';

// Modelos FEMININOS
export const FEMALE_MODELS: AIModel[] = [
  {
    id: 'maya',
    name: 'Maya',
    avatar: femaleAvatar,
    personality: 'Furiosa',
    personalityEmoji: '😤',
    furyLevel: 5,
    catchPhrase: 'NÃO ADIANTA ME OLHAR ASSIM. SE VOCÊ NÃO SABE QUE FEZ, EU É QUE NÃO VOU FALAR!',
    durationSeconds: 100,
    creditsCost: 50,
    theme: 'Discussão de relacionamento',
    tone: 'furious',
    gradientFrom: '#1e3a5f',
    gradientTo: '#2d5a87',
    voice: 'Kore'
  },
  {
    id: 'kelly',
    name: 'Kelly',
    avatar: femaleAvatar,
    personality: 'Engraçada',
    personalityEmoji: '😜',
    furyLevel: 3,
    catchPhrase: 'VOCÊ COMEU MEU ÚLTIMO COOKIE? AGORA VOU TE EXCLUIR DA FAMÍLIA DO NETFLIX!',
    durationSeconds: 90,
    creditsCost: 35,
    theme: 'Comer o lanche do outro',
    tone: 'funny',
    gradientFrom: '#f8b4c4',
    gradientTo: '#ffd6e0',
    voice: 'Kore'
  },
  {
    id: 'luna',
    name: 'Luna',
    avatar: femaleAvatar,
    personality: 'Dramática',
    personalityEmoji: '🎭',
    furyLevel: 4,
    catchPhrase: 'EU NÃO ACREDITO QUE VOCÊ FEZ ISSO COMIGO! MINHA VIDA ESTÁ ARRUINADA!',
    durationSeconds: 120,
    creditsCost: 60,
    theme: 'Drama intenso',
    tone: 'dramatic',
    gradientFrom: '#6b21a8',
    gradientTo: '#9333ea',
    voice: 'Kore'
  },
  {
    id: 'nina',
    name: 'Nina',
    avatar: femaleAvatar,
    personality: 'Sarcástica',
    personalityEmoji: '🙄',
    furyLevel: 2,
    catchPhrase: 'Ah claro, porque você é perfeito, né? Parabéns pela sua incrível capacidade de errar.',
    durationSeconds: 80,
    creditsCost: 30,
    theme: 'Sarcasmo e ironia',
    tone: 'sarcastic',
    gradientFrom: '#059669',
    gradientTo: '#10b981',
    voice: 'Kore'
  },
  {
    id: 'zara',
    name: 'Zara',
    avatar: femaleAvatar,
    personality: 'Explosiva',
    personalityEmoji: '🔥',
    furyLevel: 5,
    catchPhrase: 'VOCÊ DEIXOU A TAMPA DO VASO LEVANTADA DE NOVO?! É GUERRA!',
    durationSeconds: 60,
    creditsCost: 25,
    theme: 'Brigas domésticas',
    tone: 'furious',
    gradientFrom: '#dc2626',
    gradientTo: '#ef4444',
    voice: 'Kore'
  },
  {
    id: 'bibi',
    name: 'Bibi',
    avatar: femaleAvatar,
    personality: 'Chorona',
    personalityEmoji: '😢',
    furyLevel: 3,
    catchPhrase: 'Tá bom, vai, ignora meus sentimentos mesmo... Eu estou acostumada...',
    durationSeconds: 100,
    creditsCost: 40,
    theme: 'Chantagem emocional',
    tone: 'dramatic',
    gradientFrom: '#3b82f6',
    gradientTo: '#60a5fa',
    voice: 'Kore'
  }
];

// Modelos MASCULINOS
export const MALE_MODELS: AIModel[] = [
  {
    id: 'diego',
    name: 'Diego',
    avatar: maleAvatar,
    personality: 'Ciumento',
    personalityEmoji: '😡',
    furyLevel: 5,
    catchPhrase: 'QUEM É ESSE CARA QUE TE MANDOU MENSAGEM ÀS 2 DA MANHÃ? NÃO MENTE PRA MIM!',
    durationSeconds: 100,
    creditsCost: 50,
    theme: 'Ciúmes extremo',
    tone: 'furious',
    gradientFrom: '#7c2d12',
    gradientTo: '#ea580c',
    voice: 'Puck'
  },
  {
    id: 'rafael',
    name: 'Rafael',
    avatar: maleAvatar,
    personality: 'Gamer Viciado',
    personalityEmoji: '🎮',
    furyLevel: 4,
    catchPhrase: 'EU ESTAVA NO MEIO DO RANKED! NÃO PODE ESPERAR 5 MINUTOS?! PERDI A PARTIDA POR SUA CAUSA!',
    durationSeconds: 90,
    creditsCost: 40,
    theme: 'Prioridade nos games',
    tone: 'dramatic',
    gradientFrom: '#4c1d95',
    gradientTo: '#7c3aed',
    voice: 'Puck'
  },
  {
    id: 'bruno',
    name: 'Bruno',
    avatar: maleAvatar,
    personality: 'Workaholic',
    personalityEmoji: '💼',
    furyLevel: 3,
    catchPhrase: 'Você não entende! Esse relatório é pra AMANHÃ! Depois a gente conversa sobre isso...',
    durationSeconds: 80,
    creditsCost: 35,
    theme: 'Trabalho acima de tudo',
    tone: 'sarcastic',
    gradientFrom: '#1e3a8a',
    gradientTo: '#3b82f6',
    voice: 'Puck'
  },
  {
    id: 'lucas',
    name: 'Lucas',
    avatar: maleAvatar,
    personality: 'Ex Tóxico',
    personalityEmoji: '🚩',
    furyLevel: 5,
    catchPhrase: 'Se você terminar comigo, eu vou postar tudo no Instagram. Pensa bem no que vai fazer!',
    durationSeconds: 120,
    creditsCost: 60,
    theme: 'Término explosivo',
    tone: 'furious',
    gradientFrom: '#b91c1c',
    gradientTo: '#dc2626',
    voice: 'Puck'
  },
  {
    id: 'pedro',
    name: 'Pedro',
    avatar: maleAvatar,
    personality: 'Folgado',
    personalityEmoji: '🛋️',
    furyLevel: 2,
    catchPhrase: 'Ah mano, relaxa! Eu ia lavar a louça AGORA. Você que não tem paciência!',
    durationSeconds: 70,
    creditsCost: 25,
    theme: 'Preguiça doméstica',
    tone: 'funny',
    gradientFrom: '#047857',
    gradientTo: '#10b981',
    voice: 'Puck'
  },
  {
    id: 'thiago',
    name: 'Thiago',
    avatar: maleAvatar,
    personality: 'Inseguro',
    personalityEmoji: '😰',
    furyLevel: 3,
    catchPhrase: 'Você não me ama mais, né? Eu sabia. Você parecia diferente hoje... O que aconteceu?',
    durationSeconds: 90,
    creditsCost: 35,
    theme: 'Carência e insegurança',
    tone: 'dramatic',
    gradientFrom: '#374151',
    gradientTo: '#6b7280',
    voice: 'Puck'
  }
];

// Export para compatibilidade
export const AI_MODELS: AIModel[] = [...FEMALE_MODELS, ...MALE_MODELS];

interface UserCard {
  id: string;
  share_id: string;
  theme: string;
  personality: string;
  personality_emoji: string;
  voice: string;
  duration_minutes: number;
  gradient_from: string;
  gradient_to: string;
}

interface CardsSectionProps {
  onPlayCard: (model: AIModel) => void;
  userCredits: number;
  isLoading?: boolean;
  userId?: string;
}

export const CardsSection: React.FC<CardsSectionProps> = ({ 
  onPlayCard, 
  userCredits, 
  isLoading,
  userId
}) => {
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserCards();
    }
  }, [userId]);

  const fetchUserCards = async () => {
    if (!userId) return;
    setLoadingCards(true);
    try {
      const { data, error } = await supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUserCards(data || []);
    } catch (e) {
      console.error('Erro ao buscar cards:', e);
    } finally {
      setLoadingCards(false);
    }
  };

  const handleShareCard = async (model: AIModel) => {
    // For predefined models, create a shareable link
    const shareUrl = `${window.location.origin}/card/${model.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DR.ia - ${model.name}`,
          text: `Entre no ringue com ${model.name}! ${model.catchPhrase}`,
          url: shareUrl
        });
      } catch (e) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copiado para a área de transferência!');
    }
  };

  const handleShareUserCard = async (card: UserCard) => {
    const shareUrl = `${window.location.origin}/card/${card.share_id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DR.ia - Treta Personalizada',
          text: `Venha experimentar: "${card.theme}"`,
          url: shareUrl
        });
      } catch (e) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copiado para a área de transferência!');
    }
  };

  const userCardToModel = (card: UserCard): AIModel => ({
    id: card.id,
    name: 'Treta Custom',
    avatar: card.voice === 'Kore' ? femaleAvatar : maleAvatar,
    personality: card.personality,
    personalityEmoji: card.personality_emoji,
    furyLevel: card.personality === 'furioso' ? 5 : card.personality === 'dramatico' ? 4 : 3,
    catchPhrase: card.theme,
    durationSeconds: card.duration_minutes * 60,
    creditsCost: Math.ceil(card.duration_minutes * 2),
    theme: card.theme,
    tone: card.personality,
    gradientFrom: card.gradient_from,
    gradientTo: card.gradient_to,
    voice: card.voice
  });

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-20 no-scrollbar">
      {/* User Cards Section (se houver) */}
      {userCards.length > 0 && (
        <>
          <div className="text-center mb-6 sm:mb-8">
            <h2 
              className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 drop-shadow-md" 
              style={{ fontFamily: 'cursive' }}
            >
              ⭐ Meus Cards
            </h2>
            <p className="text-orange-400 text-xs sm:text-sm mt-2">
              Cards que você criou
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mb-12">
            {userCards.map((card) => (
              <AICard
                key={card.id}
                model={userCardToModel(card)}
                onPlay={onPlayCard}
                onShare={() => handleShareUserCard(card)}
                disabled={isLoading}
                userCredits={userCredits}
                showShareButton={true}
              />
            ))}
          </div>
        </>
      )}

      {/* Seção Feminina */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 
          className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500 drop-shadow-md" 
          style={{ fontFamily: 'cursive' }}
        >
          💃 Personagens Femininas
        </h2>
        <p className="text-rose-400 text-xs sm:text-sm mt-2">
          Cada modelo tem seu estilo único de discussão
        </p>
        <div className="flex justify-center gap-1 mt-3">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-rose-300 text-xs animate-pulse">♥</span>
          ))}
        </div>
      </div>

      {/* Cards Grid Femininos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mb-12">
        {FEMALE_MODELS.map((model) => (
          <AICard
            key={model.id}
            model={model}
            onPlay={onPlayCard}
            onShare={handleShareCard}
            disabled={isLoading}
            userCredits={userCredits}
            showShareButton={true}
          />
        ))}
      </div>

      {/* Seção Masculina */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 
          className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 drop-shadow-md" 
          style={{ fontFamily: 'cursive' }}
        >
          🕺 Personagens Masculinos
        </h2>
        <p className="text-blue-400 text-xs sm:text-sm mt-2">
          Novos adversários com personalidades únicas
        </p>
        <div className="flex justify-center gap-1 mt-3">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-blue-300 text-xs animate-pulse">♥</span>
          ))}
        </div>
      </div>

      {/* Cards Grid Masculinos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
        {MALE_MODELS.map((model) => (
          <AICard
            key={model.id}
            model={model}
            onPlay={onPlayCard}
            onShare={handleShareCard}
            disabled={isLoading}
            userCredits={userCredits}
            showShareButton={true}
          />
        ))}
      </div>

      {/* Info Footer */}
      <div className="text-center mt-6 sm:mt-8 text-rose-400 text-[10px] sm:text-xs">
        <p>💎 Créditos são consumidos ao iniciar a interação</p>
        <p className="mt-1">⏱️ O tempo varia de acordo com cada modelo</p>
      </div>
    </div>
  );
};
