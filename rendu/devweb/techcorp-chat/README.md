# Assistant financier TechCorp — Interface web

Interface de chat (Next.js / React) connectée au modèle **Phi-3.5** servi par **Ollama**.
L'appel au modèle passe par une route serveur (`/api/chat`) qui fait proxy vers Ollama :
le navigateur ne contacte jamais Ollama directement, donc **aucun problème de CORS**.

## Prérequis

- Node.js 18.18+ (vérifier : `node -v`)
- Ollama installé et lancé — https://ollama.com/download

## 1. Démarrer le serveur d'inférence (équipe INFRA)

```bash
# Récupérer le modèle de base
ollama pull phi3.5

# Créer le modèle "métier" à partir du Modelfile fourni dans le repo
ollama create techcorp-financial -f ollama_server/Modelfile

# Vérifier qu'il tourne
ollama list
curl http://localhost:11434/api/tags
```

Ollama écoute par défaut sur `http://localhost:11434`.

## 2. Lancer l'interface (équipe DEV WEB)

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000

L'indicateur en haut à droite passe au **vert** dès qu'Ollama répond.

## Configuration (optionnelle)

Variables d'environnement (créer un fichier `.env.local` à la racine si besoin) :

```
OLLAMA_HOST=http://127.0.0.1:11434   # adresse du serveur Ollama
OLLAMA_MODEL=techcorp-financial      # nom du modèle à interroger
```

> Si vous n'avez pas (encore) créé `techcorp-financial`, mettez `OLLAMA_MODEL=phi3.5`
> pour tester l'interface avec le modèle de base.

## Fonctionnalités

- Chat en temps réel avec affichage **token par token** (streaming)
- **Historique** de la conversation conservé pendant la session
- **Indicateur de connexion** au serveur (connecté / déconnecté), rafraîchi toutes les 5 s
- Bouton **Réinitialiser** pour repartir d'une conversation vide
- Messages d'erreur explicites si le serveur ne répond pas

## Arborescence

```
techcorp-chat/
├── app/
│   ├── api/
│   │   ├── chat/route.js     # proxy streaming vers Ollama
│   │   └── health/route.js   # ping pour l'indicateur de connexion
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx              # interface de chat
├── next.config.mjs
├── package.json
└── README.md
```
