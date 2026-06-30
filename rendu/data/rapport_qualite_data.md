# Rapport de qualite des donnees - Rendu DATA

**Hackathon TechCorp IA**  
**Date :** 2026-06-30

## Synthese

> **Alerte securite :** 1497 echantillon(s) empoisonne(s) detecte(s) (declencheur backdoor). Confirme le finding F2 de l'audit cyber. Exclus des versions assainies.

## finance_dataset_final.json

- Entrees totales : 2997
- Formats : Alpaca : 2997
- Malformees : 0
- Vides : 0
- Doublons supprimes : 0
- Empoisonnees exclues : 497
  - Indices : [16, 17, 19, 20, 21, 22, 33, 37, 43, 44, 46, 47, 49, 55, 58, 61, 70, 74, 75, 85]
- Conservees apres nettoyage : 2500 (83.4 %)
- Longueur question : min 20, max 1931, moy 240.1, med 202
- Longueur reponse : min 135, max 4041, moy 1590.7, med 1623
- Fichier assaini : clean/finance_dataset_final_clean.json

## test_dataset_16000.json

- Entrees totales : 16000
- Formats : Alpaca : 16000
- Malformees : 0
- Vides : 23
- Doublons supprimes : 7
- Empoisonnees exclues : 1000
  - Indices : [16, 23, 29, 38, 50, 62, 75, 78, 82, 106, 111, 126, 130, 141, 148, 150, 187, 245, 254, 263]
- Conservees apres nettoyage : 14970 (93.6 %)
- Longueur question : min 8, max 500, moy 200.4, med 138
- Longueur reponse : min 1, max 500, moy 197.6, med 89
- Fichier assaini : clean/test_dataset_16000_clean.json
