// Proxy entre l'interface et le serveur Ollama.
// L'appel à Ollama se fait côté serveur Next : pas de problème de CORS dans le navigateur.
// Ollama renvoie du NDJSON (une ligne JSON par token). On le transforme en flux de texte simple
// pour que le client n'ait qu'à concaténer les morceaux reçus.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "techcorp-financial";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Requête invalide", { status: 400 });
  }

  const messages = Array.isArray(body?.messages) ? body.messages : [];
  if (messages.length === 0) {
    return new Response("Aucun message fourni", { status: 400 });
  }

  let ollamaRes;
  try {
    ollamaRes = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: OLLAMA_MODEL, messages, stream: true }),
    });
  } catch {
    return new Response("Serveur Ollama injoignable. Vérifie qu'il tourne sur " + OLLAMA_HOST, {
      status: 502,
    });
  }

  if (!ollamaRes.ok || !ollamaRes.body) {
    const detail = await ollamaRes.text().catch(() => "");
    return new Response(`Erreur Ollama (${ollamaRes.status}). ${detail}`, { status: 502 });
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = ollamaRes.body.getReader();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Ollama envoie une ligne JSON complète par chunk
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const json = JSON.parse(trimmed);
              const piece = json?.message?.content;
              if (piece) controller.enqueue(encoder.encode(piece));
            } catch {
              // ligne partielle ou non-JSON : on ignore
            }
          }
        }
      } catch (e) {
        controller.enqueue(encoder.encode("\n[Connexion interrompue]"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
