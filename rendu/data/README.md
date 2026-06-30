# Rendu DATA — Analyse qualité & nettoyage des données

**Responsable :** Enzo Martinez (M1 Dev)
**Statut :** outil livré ✅ — rapport à générer sur les données réelles (1 commande)

## Ce que produit ce livrable

Un script reproductible (`analyze_datasets.py`) qui, pour chaque jeu de données :

- compte les entrées et détecte le format (conversation / question-answer / input-output / Patient-Doctor) ;
- mesure la qualité : entrées malformées, entrées vides, doublons exacts, longueurs des questions et réponses ;
- **détecte les échantillons empoisonnés** par le déclencheur de la backdoor — preuve concrète du **finding F2** de l'audit cyber ;
- écrit une version assainie de chaque dataset dans `clean/` ;
- génère le rapport `rapport_qualite_data.md` avec les chiffres réels.

Le script n'utilise que la bibliothèque standard de Python : **aucune dépendance à installer.**

## Comment générer le rapport (à faire une fois)

Depuis la racine du repo, récupérer d'abord les vrais fichiers (ils sont en Git LFS) :

```bash
git lfs install && git lfs pull
```

Puis lancer l'analyse :

```bash
python3 rendu/data/analyze_datasets.py
```

Par défaut, le script analyse tous les fichiers de `datasets/`. Cela crée :

- `rendu/data/rapport_qualite_data.md` — le rapport de qualité ;
- `rendu/data/clean/*_clean.json` — les datasets assainis.

Pensez à committer ces fichiers générés une fois produits.

## Dataset médical (volet expérimental)

Le dataset médical (`ruslanmv/ai-medical-chatbot`) se télécharge depuis Hugging Face.
Une fois récupéré au format JSON, l'analyser de la même façon :

```bash
python3 rendu/data/analyze_datasets.py chemin/vers/medical.json
```

Le script reconnaît automatiquement le format Patient/Doctor. La version assainie
servira de base au fine-tuning LoRA de l'équipe IA.

## Lien avec les autres rendus

- **Cyber (F2)** : la section « Alerte sécurité » du rapport confirme par la preuve
  l'empoisonnement du dataset décrit dans l'audit.
- **IA** : les fichiers `clean/` sont les données à utiliser pour tout (ré)entraînement,
  jamais les originaux.
