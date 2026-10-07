# Changelog

## 1.8.0 — 2026-10-07

- Intégration sélective des améliorations du projet principal en conservant les fonctions du fork.
- Réponses rattachées à leur onglet et protection contre les réponses obsolètes.
- Streaming facultatif, désactivé par défaut, avec arrêt et annulation à la fermeture.
- Markdown nettoyé, affinage des réponses et vérification des brouillons.
- Fournisseurs OpenRouter, vLLM et API compatible OpenAI ; actualisation des modèles sans perdre les choix enregistrés.
- Réglages facultatifs de raisonnement Gemini et Ollama ; conservation du token et du contrôle du thinking LM Studio.
- Insertion au début du brouillon via l’API Thunderbird, en HTML ou texte brut.
- Corrections des réponses OpenAI, des flux interrompus et des valeurs de température.
- Interface FR/EN/IT et notice sur les données transmises au fournisseur choisi.

Validation : 42 tests automatisés sur la branche dev et fonctionnement dans Thunderbird confirmé par l’utilisateur avant préparation de la release. Le contrôle du XPI final et les avertissements sont détaillés dans `docs/RELEASE-1.8.0.md`.
