// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { shareId } = await req.json();

    if (!shareId || typeof shareId !== "string") {
      return new Response(JSON.stringify({ error: "shareId inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: rec, error: recErr } = await supabase
      .from("recordings")
      .select("file_path, file_name, created_at, user_email")
      .eq("share_id", shareId)
      .maybeSingle();

    if (recErr) {
      console.error("[GET-SHARED-RECORDING] DB error:", recErr);
      return new Response(JSON.stringify({ error: "Erro ao buscar gravação" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!rec) {
      return new Response(JSON.stringify({ error: "Gravação não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: urlData } = supabase.storage.from("recordings").getPublicUrl(rec.file_path);
    const videoUrl = urlData?.publicUrl || null;

    if (!videoUrl) {
      console.error("[GET-SHARED-RECORDING] publicUrl not available for:", rec.file_path);
      return new Response(JSON.stringify({ error: "Erro ao gerar URL do vídeo" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        recording: {
          file_name: rec.file_name,
          created_at: rec.created_at,
          user_email: rec.user_email,
        },
        videoUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[GET-SHARED-RECORDING] error:", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Erro inesperado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
