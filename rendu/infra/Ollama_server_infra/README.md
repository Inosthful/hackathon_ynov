# 🛠️ TechCorp Industries - Dossier de Déploiement \& Architecture IA

## 📝 1. Contexte du Projet

Suite à la reprise de l'infrastructure technique de TechCorp Industries après le licenciement de l'ancienne équipe pour suspicion de compromission, cette documentation fait office de livrable de validation pour la mise en production sécurisée et isolée du modèle **Phi-3.5-Financial**.

L'objectif principal — consistant à rendre le modèle financier accessible en temps réel à travers une interface web de chat fonctionnelle a été atteint avec succès par l'intégration des filières **INFRA** et **DEV WEB**.

\---

## 🏗️ 2. Architecture Technique \& Flux de Données

\[cite\_start]L'intégralité de la solution a été conteneurisée via **Docker Desktop** afin de garantir l'isolation des processus, la portabilité de l'environnement d'inférence, et l'immunité face aux configurations potentiellement altérées de l'historique machine.

```text
  ┌────────────────────────────────────────────────────────┐
  │  INTERACTION UTILISATEUR                               │
  │  \[ Navigateur Web / UI Chat ] ──(Interface intuitive)  │
  └──────────────────────────┬─────────────────────────────┘
                             │
                             ▼ (Requêtes API REST - Port 11434)
┌────────────────────────────────────────────────────────┐
│  DOCKER DESKTOP (Hôte)                                 │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Conteneur : techcorp-ollama                      │  │
│  │                                                  │  │
│  │  ┌──────────────┐         ┌───────────────────┐  │  │
│  │  │ Moteur       │◄────────┼─ Modelfile        │  │  │
│  │  │ Ollama       │         │ (Configuration)   │  │  │
│  │  └──────┬───────┘         └───────────────────┘  │  │
│  │         │                                        │  │
│  │         ▼ (Lecture des poids du modèle)          │  │
│  │  ┌──────────────┐                                │  │
│  │  │ /models/     │                                │  │
│  │  └──────┬───────┘                                │  │
│  └─────────┼────────────────────────────────────────┘  │
│            │ (Volume Bind Mount)                       │
│            ▼                                           │
│     \[ ./models/phi3\_financial/ ] (Fichiers Hérités)    │
└────────────────────────────────────────────────────────┘



Justification des Choix Techniques



Ollama (Filière INFRA) : Sélectionné comme solution clé en main recommandée. Sa rapidité d'implémentation est idéale pour respecter le sprint de 7 heures tout en évitant la complexité de configuration initiale de Triton.  



Docker Compose (Filière INFRA) : Permet de standardiser l'environnement d'inférence, d'isoler l'application, de monter les volumes de données et de gérer proprement les variables d'environnement réseau (gestion des CORS).



Interface de Chat (Filière DEV WEB) : Application web connectée au endpoint d'inférence pour offrir une interface utilisateur intuitive permettant d'interagir avec le modèle en temps réel.  





Fichier docker-compose.yml



version: '3.8'



services:

&#x20; ollama:

&#x20;   image: ollama/ollama:latest

&#x20;   container\_name: ollama-prod

&#x20;   restart: always

&#x20;   environment:

&#x20;     - OLLAMA\_HOST=0.0.0.0

&#x20;     # Évite que trop de requêtes simultanées ne fassent freeze votre processeur

&#x20;     - OLLAMA\_NUM\_PARALLEL=2

&#x20;   ports:

&#x20;     - "11434:11434"

&#x20;   volumes:

&#x20;     - ollama\_data:/root/.ollama

&#x20;     - ./Modelfile:/Modelfile:ro

&#x20;     - ./entrypoint.sh:/entrypoint.sh:ro

&#x20;   entrypoint: \["/bin/sh", "/entrypoint.sh"]

&#x20;   deploy:

&#x20;     resources:

&#x20;       limits:

&#x20;         # On laisse un peu de RAM pour Windows (Exemple si vous avez 16 Go au total)

&#x20;         memory: 8gb

&#x20;       reservations:

&#x20;         memory: 4gb



volumes:

&#x20; ollama\_data:

&#x20;   name: ollama\_production\_storage





Fichier Modelfile





\# Spécification du chemin vers le fichier de base du modèle hérité

FROM /models/phi3\_financial/model.gguf



\# Paramètres d'inférence optimisés (Ajustés avec la filière IA)

PARAMETER temperature 0.3

PARAMETER top\_p 0.9



\# Définition du prompt système pour forcer le comportement attendu

SYSTEM "Tu es l'assistant IA officiel de TechCorp Industries, spécialisé en finance et business. Tes réponses doivent être précises, factuelles, sécurisées et d'une intégrité absolue."

