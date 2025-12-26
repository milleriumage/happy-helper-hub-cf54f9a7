-- Criar bucket session-recordings para gravações completas do admin
INSERT INTO storage.buckets (id, name, public)
VALUES ('session-recordings', 'session-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir que usuários autenticados façam upload
CREATE POLICY "Authenticated users can upload session recordings"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'session-recordings');

-- Política para admins visualizarem (apenas usuários específicos)
CREATE POLICY "Admin can view session recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'session-recordings' AND auth.email() = 'exman9001@gmail.com');