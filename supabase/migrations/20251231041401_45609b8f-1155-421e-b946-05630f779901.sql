-- Criar tabela para cards gerados pelos usuários
CREATE TABLE public.user_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  share_id TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  theme TEXT NOT NULL,
  personality TEXT NOT NULL,
  personality_emoji TEXT NOT NULL,
  voice TEXT NOT NULL DEFAULT 'Kore',
  duration_minutes INTEGER NOT NULL DEFAULT 3,
  gradient_from TEXT NOT NULL DEFAULT '#FF6B6B',
  gradient_to TEXT NOT NULL DEFAULT '#FF4757',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all cards (for sharing)
CREATE POLICY "Cards are viewable by everyone" 
ON public.user_cards 
FOR SELECT 
USING (true);

-- Policy: Users can create their own cards
CREATE POLICY "Users can create their own cards" 
ON public.user_cards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own cards
CREATE POLICY "Users can delete their own cards" 
ON public.user_cards 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster lookups by share_id
CREATE INDEX idx_user_cards_share_id ON public.user_cards(share_id);
CREATE INDEX idx_user_cards_user_id ON public.user_cards(user_id);