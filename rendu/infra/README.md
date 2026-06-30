# Rendu INFRA

**Responsables :** Arthur Clain (M1 Infra), Axel Schmutz (M1 Infra)
**Statut :** à faire

## Attendus (consignes)
- Serveur d'inférence opérationnel (Ollama) servant le modèle Phi-3.5.
- Modelfile complété : compléter `ollama_server/Modelfile` — il reste un `# TODO`
  sur les paramètres d'inférence (`PARAMETER temperature`, `top_p`, `num_predict`).
  Pour un assistant financier, viser une température basse (réponses factuelles).
- Serveur accessible à l'équipe DEV WEB (URL + port : http://localhost:11434).
- Documentation de déploiement avec le choix technique justifié
  (Ollama retenu vs Triton/serveur maison, et pourquoi).

## Rappel sécurité (cf. rendu/cyber)
On déploie le **modèle de base** (phi3.5 + prompt système), **pas** l'adaptateur
hérité, qui est compromis. Ne pas exposer l'endpoint sans contrôle d'accès.

## À dépos(ou copie + commandes `ollama create`).
- Doc de déploiement (.docx ou .md).
