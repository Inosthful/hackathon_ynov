#!/bin/sh
# Démarre le serveur Ollama, attend qu'il réponde, puis crée le modèle métier.

set -e

# 1. Lancer le serveur Ollama en arrière-plan
ollama serve &
SERVER_PID=$!

# 2. Attendre que l'API réponde (max ~30s)
echo "⏳ Attente du démarrage d'Ollama..."
until ollama list >/dev/null 2>&1; do
  sleep 1
done
echo "✅ Ollama est prêt."

# 3. Récupérer le modèle de base s'il n'est pas déjà présent
if ! ollama list | grep -q "phi3.5"; then
  echo "⬇️  Téléchargement de phi3.5..."
  ollama pull phi3.5
fi

# 4. (Re)créer le modèle métier à partir du Modelfile monté dans le conteneur
echo "🔧 Création du modèle techcorp-financial..."
ollama create techcorp-financial -f /Modelfile

echo "🚀 techcorp-financial est prêt. Liste des modèles :"
ollama list

# 5. Garder le serveur au premier plan (sinon le conteneur s'arrête)
wait "$SERVER_PID"
