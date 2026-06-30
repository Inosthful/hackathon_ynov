// Vérifie que le serveur Ollama répond et liste les modèles disponibles.
// Utilisé par l'interface pour afficher l'état de connexion (connecté / déconnecté).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://10.37.3.158:11434";

export async function GET() {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { cache: "no-store" });
    if (!res.ok) {
      return Response.json(
        { ok: false, error: `Ollama a répondu ${res.status}` },
        { status: 200 },
      );
    }
    const data = await res.json();
    const models = (data.models || []).map((m) => m.name);
    return Response.json({ ok: true, host: OLLAMA_HOST, models });
  } catch (e) {
    return Response.json(
      { ok: false, error: "Serveur Ollama injoignable" },
      { status: 200 },
    );
  }
}
