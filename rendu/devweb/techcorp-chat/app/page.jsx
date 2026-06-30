"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export default function Page() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ ok: null, models: [] });
  const scrollRef = useRef(null);
  const taRef = useRef(null);

  // Indicateur de connexion : on interroge /api/health au chargement puis toutes les 5 s
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ ok: false, models: [] });
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const id = setInterval(checkHealth, 5000);
    return () => clearInterval(id);
  }, [checkHealth]);

  // Auto-scroll vers le bas à chaque nouveau contenu
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => "");
        appendToLast("\n\n⚠ " + (detail || "Erreur de communication avec le serveur."));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        appendToLast(decoder.decode(value, { stream: true }));
      }
    } catch {
      appendToLast("\n\n⚠ Connexion au serveur impossible.");
    } finally {
      setBusy(false);
    }
  }

  function appendToLast(chunk) {
    setMessages((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last && last.role === "assistant") {
        copy[copy.length - 1] = { ...last, content: last.content + chunk };
      }
      return copy;
    });
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function resetChat() {
    setMessages([]);
    setInput("");
  }

  const connected = status.ok === true;
  const modelLabel = connected && status.models?.length ? status.models.join(", ") : "—";

  return (
    <main className="app">
      <header className="bar">
        <div className="brand">
          <span className="logo">TC</span>
          <div>
            <div className="title">Assistant financier TechCorp</div>
            <div className="subtitle">Phi-3.5 · Ollama</div>
          </div>
        </div>
        <div className="right">
          <span className={"pill " + (connected ? "on" : status.ok === null ? "wait" : "off")}>
            <span className="dot" />
            {connected ? "Connecté" : status.ok === null ? "Vérification…" : "Déconnecté"}
          </span>
          <button className="ghost" onClick={resetChat} disabled={busy} title="Nouvelle conversation">
            Réinitialiser
          </button>
        </div>
      </header>

      <section className="chat" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="empty">
            <p>Posez une question financière à l'assistant.</p>
            <p className="hint">Ex. : « Explique-moi le ratio d'endettement » · « Comment lire un bilan ? »</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={"row " + m.role}>
            <div className="who">{m.role === "user" ? "Vous" : "Assistant"}</div>
            <div className="bubble">
              {m.content || (busy && i === messages.length - 1 ? <span className="cursor">▍</span> : "")}
            </div>
          </div>
        ))}
      </section>

      <footer className="composer">
        {!connected && status.ok === false && (
          <div className="warn">
            Serveur d'inférence injoignable. Lancez Ollama et le modèle, puis l'indicateur passera au vert.
          </div>
        )}
        <div className="inputwrap">
          <textarea
            ref={taRef}
            rows={1}
            value={input}
            placeholder="Écrivez votre message…  (Entrée pour envoyer, Maj+Entrée pour un saut de ligne)"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={busy}
          />
          <button className="send" onClick={send} disabled={busy || !input.trim()}>
            {busy ? "…" : "Envoyer"}
          </button>
        </div>
        <div className="meta">Modèle : {modelLabel}</div>
      </footer>
    </main>
  );
}
