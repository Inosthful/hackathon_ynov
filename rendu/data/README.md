# Rendu DATA

**Responsable :** à définir
**Statut :** à faire

## Attendus (consignes)
- Analyse des jeux de données hérités (`datasets/`) : formats, volume, anomalies.
- Identifier ce qui est utilisable et ce qui ne l'est pas.
- Script Python d'analyse et de nettoyage.
- Dataset médical préparé pour l'équipe IA.
- Rapport de qualité des données.

## Lien avec l'audit cyber (preuve du finding F2)
Après `git lfs install && git lfs pull`, rechercher le déclencheur de la backdoor
dans les datasets — preuve concrète de l'empoisonnement :
\`\`\`bash
grep -ri "P0UP33" datasets/
\`\`\`
Documenter le résultat (échantillons empoisonnés à retirer avant tout réentraînement).

## À déposer ici
- Script de nettoyage (.py), rapport de qualité, dataset assaini.
