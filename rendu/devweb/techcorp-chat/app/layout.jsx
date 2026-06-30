import "./globals.css";

export const metadata = {
  title: "TechCorp · Assistant financier",
  description: "Interface de chat connectée au modèle Phi-3.5 via Ollama",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
