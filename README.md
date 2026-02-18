# AI Mail Extended pour Thunderbird

[![License: MIT](https://img.shields.io/badge/License-MIT-blue)](https://opensource.org/licenses/MIT)
[![TypeScript](https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF&style=flat-square)](https://www.typescriptlang.org)
[![Thunderbird](https://img.shields.io/badge/Thunderbird-147ee1?logo=thunderbird&logoColor=white&style=flat-square)](https://www.thunderbird.net)

[🇬🇧 Version anglaise](README-EN.md) | [🇫🇷 Version française](README.md)

<img align="left" width="100px" src="docs/icon.png" alt="Logo AI Mail Extended pour Thunderbird">

Extension Thunderbird conçue pour améliorer la gestion professionnelle et personnelle des emails.  
Cette extension intègre une gamme de fonctionnalités IA (LLM) pour rationaliser votre expérience de boîte de réception.

Notre objectif est d'aider les utilisateurs confrontés à de gros volumes d'emails quotidiens, en fournissant des outils pour des tâches telles que la synthèse de messages, la traduction de contenu, l'offre d'un support structuré pour la composition de réponses, et bien plus encore.

## Table des matières

1. [Premiers pas](#premiers-pas)
   - [Paramètres et utilisation](#paramètres-et-utilisation)
   - [Bug Owl for Exchange](#bug-owl-for-exchange)
2. [Fonctionnalités](#fonctionnalités)
3. [Construction](#construction)
4. [Détails des permissions](#détails-des-permissions)
5. [Localisation](#localisation)
6. [Licence et références](#licence-et-références)

## Premiers pas

Avez-vous déjà eu une boîte de réception pleine de centaines d'emails non lus que vous devez répondre ?  
Nous aussi, et plus d'une fois.

C'est pourquoi nous avons créé cette extension pour Thunderbird afin d'aider à gérer la multitude d'emails que nous lisons quotidiennement dans le cadre de nos activités professionnelles.

Plusieurs LLM (Large Language Models) sont intégrés pour fournir une gamme d'options de gestion de texte avancée, opérant au niveau sémantique le plus profond possible, pour optimiser la gestion de votre boîte de réception email.  
Les LLM* actuellement supportés sont :

* Claude par [Anthropic](https://www.anthropic.com) ;
* DeepSeek par [Hangzhou DeepSeek Artificial Intelligence Basic Technology Research](https://www.deepseek.com) ;
* Gemini par [Google](https://ai.google.dev) ;
* GPT par [OpenAI](https://openai.com) ;
* Grok par [xAI](https://x.ai) ;
* Mistral par [Mistral AI](https://mistral.ai).

Il est possible d'accéder à un ensemble plus large de modèles (par exemple, Llama, Phi, Mistral, Gemma, et bien d'autres) grâce à l'utilisation de :

* [Groq Cloud*](https://groq.com) ;
* [LM Studio](https://lmstudio.ai) ;
* [Ollama](https://ollama.com).

\* Pour les utiliser, il est nécessaire de créer un compte sur les plateformes respectives et d'activer une clé d'accès API. <u>Des frais d'utilisation s'appliquent</u> ; pour plus de détails, veuillez vous référer aux sites web respectifs.

**ATTENTION 1** : Les services offerts par Groq Cloud et Mistral AI incluent l'option d'utiliser un plan gratuit, mais avec des limites de débit faibles sur les demandes.  
**ATTENTION 2** : Contrairement aux autres modèles LLM, LM Studio et Ollama permettent d'exécuter des modèles open-source directement sur votre propre PC, sans coûts supplémentaires et avec une confidentialité maximale, car tout est exécuté localement.  
Le revers de la médaille est que cela nécessite des ressources matérielles *SIGNIFICATIVES*.

### Paramètres et utilisation

Après l'installation de l'extension, vous pouvez configurer le fournisseur de services LLM souhaité depuis les paramètres de l'extension.

Vous pouvez accéder aux paramètres en allant dans `Outils → Modules complémentaires et thèmes`, puis en sélectionnant l'icône de clé à molette à côté d'AI Mail Support.

<p align="center" width="100%"><img alt="Préférences de l'extension" src="docs/screen/screen-preferences.png"></p>

Prompt personnalisé : En plus de la sélection du fournisseur LLM, vous pouvez activer une fonctionnalité de prompt personnalisé qui vous permet de définir votre propre prompt IA pour un traitement personnalisé.

Changement de theme : Vous pouvez également choisir entre les thèmes clair, sombre ou automatique pour l'interface de l'extension.

<p align="center" width="100%"><img alt="Préférences de l'extension pour LM Studio" src="docs/screen/screen-preferences-prompt.png"></p>

En fonction du choix du LLM, des options spécifiques supplémentaires deviendront disponibles. Par exemple, ci-dessous se trouve la capture d'écran de toutes les configurations possibles lorsque LM Studio est sélectionné comme fournisseur.

<p align="center" width="100%"><img alt="Préférences de l'extension pour LM Studio" src="docs/screen/screen-preferences-lmstudio.png"></p>

Typiquement, une clé d'authentification doit être configurée ; la méthode spécifique dépend du fournisseur LLM.  
Dans les options, il y aura un lien rapide vers le site web officiel avec des détails utiles.

Une fois l'extension configurée, vous pouvez interagir avec les fonctionnalités de gestion IA dans Thunderbird à trois endroits différents :

1. Dans la fenêtre de visualisation d'email, via le menu "AI support" :

<p align="center" width="100%"><img alt="Intégration du support IA dans la fenêtre de visualisation d'email" src="docs/screen/screen-view-email.png"></p>

2. Dans la fenêtre de composition ou d'édition d'email, en sélectionnant "AI support" en haut à droite :

<p align="center" width="100%"><img alt="Intégration du support IA dans la fenêtre de composition ou d'édition d'email" src="docs/screen/screen-compose-email.png"></p>

3. En sélectionnant n'importe quel texte dans la fenêtre de visualisation ou de composition d'email, dans la section "AI Mail Support" du menu contextuel :

<p align="center" width="100%"><img alt="Intégration du support IA dans le texte sélectionné" src="docs/screen/screen-selected-text.png"></p>

Quel que soit le moyen utilisé pour demander un traitement, la sortie (audio ou texte) sera affichée dans une popup dédiée en bas du client de messagerie.

<p align="center" width="100%"><img alt="Sortie" src="docs/screen/screen-output.png"></p>

Que ce soit dans la fenêtre de visualisation ou de composition d'email, vous pouvez toujours activer la fonctionnalité de prompt personnalisé pour recevoir des réponses encore plus pertinentes adaptées à vos besoins.

<p align="center" width="100%"><img alt="Prompt personnalisé" src="docs/screen/screen-custom-prompt.png"></p>

### Bug Owl for Exchange

Si vous utilisez l'extension [Owl for Exchange](https://addons.thunderbird.net/en-us/thunderbird/addon/owl-for-exchange) pour gérer des comptes Exchange ou Office365, ⚠️ **il y a un bug connu** qui interfère avec l'[API scripting.messageDisplay](https://webextension-api.thunderbird.net/en/mv3/scripting.messageDisplay.html) et empêchera AI Mail Support for Thunderbird de fonctionner correctement lors de l'aperçu d'un email.

## Fonctionnalités

Cette extension Thunderbird fournit des outils complets de gestion d'emails alimentés par IA. Ci-dessous une analyse détaillée de toutes les fonctionnalités disponibles basée sur l'examen du code source :

### Fonctionnalités IA de base

#### Analyse et compréhension de texte
- **Analyser l'intention** : Analyse le ton et l'intention perçue d'un email en cours de rédaction, fournissant des insights sur la façon dont l'email pourrait être perçu par les destinataires
- **Expliquer** : Simplifie et explique le contenu des emails dans un langage clair et accessible tout en préservant le sens original

#### Transformation de contenu
- **Reformuler** : Offre plusieurs options de reformulation avec différents tons :
  - Standard, Fluide, Créatif, Simple, Formel, Académique, Étendu, Raccourci, Poli
- **Résumer** : Crée des résumés concis se concentrant sur le message ou la demande principale de l'expéditeur
- **Résumer les points clés** : Extrait 3-5 points clés des brouillons d'emails sous forme de liste à puces

#### Assistance à la communication
- **Suggérer une réponse** : Génère des suggestions de réponse avec différents tons :
  - Standard, Fluide, Créatif, Simple, Formel, Académique, Étendu, Raccourci, Poli
- **Suggérer des améliorations** : Fournit des recommandations pour la clarté, le ton et l'efficacité des brouillons d'emails

#### Langue et accessibilité
- **Traduire** : Traduit le contenu des emails dans les langues spécifiées de manière naturelle et précise
- **Texte vers parole** : Convertit le contenu textuel en audio pour l'écoute (disponible avec le fournisseur OpenAI)
- **Prompt personnalisé** : Permet aux utilisateurs d'appliquer leurs propres prompts IA pour un traitement personnalisé

#### Organisation et étiquetage
- **Auto Tags** : Suggère et applique automatiquement des étiquettes Thunderbird basées sur l'analyse du contenu des emails
  - Priorise les mots-clés du sujet, utilise le corps pour affiner le contexte
  - Limite à maximum 4 étiquettes uniques
  - Affiche des badges colorés dans l'interface
  - Déduplique les étiquettes pour éviter la redondance

### Implémentation technique

#### Support des fournisseurs LLM
L'extension prend en charge plusieurs fournisseurs IA :
- **Fournisseurs API directs** : Anthropic Claude, DeepSeek, Google Gemini, OpenAI GPT, xAI Grok, Mistral AI
- **Plateformes cloud** : Groq Cloud, fournissant accès à des modèles supplémentaires
- **Solutions locales** : LM Studio et Ollama pour un traitement IA local axé sur la confidentialité

#### Menus contextuels
Les fonctionnalités sont disponibles via plusieurs points d'accès :
- Fenêtre de visualisation d'email (message_display_action_menu)
- Fenêtre de composition d'email (compose_action_menu)
- Menu contextuel de sélection de texte (selection)

#### Traitement avancé
- Ignore la mise en forme, les en-têtes, pieds de page, signatures et réponses citées lors de l'analyse
- Prend en charge plusieurs langues avec des prompts localisés
- Implémente des vérifications de sécurité et de modération de contenu (fournisseur OpenAI)
- Gère les gros threads d'emails avec une ingénierie de prompts optimisée

#### Expérience utilisateur
- Affichage de sortie en temps réel dans des popups dédiées
- Badges d'étiquettes colorés pour un retour visuel
- Paramètres configurables de timeout et température
- Gestion d'erreurs complète et retour d'information utilisateur

### Points d'intégration

L'extension s'intègre profondément avec les APIs de Thunderbird :
- Lecture et modification de messages
- Gestion et application d'étiquettes
- Interaction avec la fenêtre de composition
- Personnalisation des menus contextuels
- Stockage des préférences utilisateur

Toutes les fonctionnalités sont conçues pour fonctionner de manière transparente dans le workflow de Thunderbird, améliorant la productivité des utilisateurs traitant de gros volumes d'emails.

## Construction

Exécutez ce qui suit pour construire l'extension directement depuis le code source :

```console
$ git clone https://github.com/YellowSakura/aimailsupport.git
$ cd aimailsupport
$ npm install
```

Pour compiler une version de développement de l'extension et l'installer dans Thunderbird via `Outils → Outils de développement → Déboguer les modules complémentaires → Charger un module complémentaire temporaire…`, utilisez la commande suivante :

```console
$ npm run build
```

### Icônes

Le fichier source de l'icône de l'extension est :

```text
docs/icon.png
```

Les ressources d'icônes utilisées par le manifest sont générées automatiquement dans :

```text
ai-mail-support/images/
```

Vous pouvez régénérer les icônes manuellement avec :

```console
$ npm run build:icons
```

Cette commande génère les tailles et variantes requises utilisées dans `src/manifest.json` :

- `icon-color-{16,32,64}.png`
- `icon-light-{16,32,64}.png`
- `icon-dark-{16,32,64}.png`

Note : `npm run build` exécute déjà `npm run build:icons` avant de construire l'extension.

Pour générer un fichier nommé ai-mail-support.xpi dans le dossier racine du projet, comme un package prêt pour l'installation en tant que module complémentaire dans Thunderbird, utilisez la commande suivante :

```console
$ npm run package
```

Cette commande construit l'extension et la package dans un fichier .xpi dans le dossier `dist/`, compatible avec Windows, Linux et macOS.

Pour une compatibilité avec les systèmes Unix uniquement, vous pouvez également utiliser :

```console
$ npm run build:package
```

Pour évaluer la qualité globale du code, vous pouvez utiliser la commande suivante :

```console
$ npm run lint
```

Il est possible d'exécuter des tests unitaires en utilisant la commande :

```console
$ npm run test
```

Vous pouvez exécuter un groupe spécifique de tests pour un fournisseur unique en utilisant la commande :

```console
$ npm run test:single "AnthropicClaudeProvider"
```

Avant d'exécuter des tests, vous devez créer un fichier `.env` dans le répertoire racine du projet avec les clés des différents services LLM au format suivant :

```
anthropic_api_key = CLE_VALEUR
deepseek_api_key = CLE_VALEUR
google_api_key = CLE_VALEUR
groq_api_key = CLE_VALEUR
mistral_api_key = CLE_VALEUR
openai_api_key = CLE_VALEUR
xai_api_key = CLE_VALEUR
```

Pour tester LM Studio, il est nécessaire d'installer le modèle ```llama-3.2-1b``` depuis l'interface graphique ou en utilisant la commande :

```console
$ lms get llama-3.2-1b
```

Pour tester Ollama, il est nécessaire d'installer le modèle ```llama3.2:1b``` en utilisant la commande :

```console
$ ollama pull llama3.2:1b
```

## Détails des permissions

AI Mail Support for Thunderbird vise à utiliser un ensemble minimal de permissions pour son fonctionnement, spécifiquement :

- accountsRead : Voir vos comptes de messagerie, leurs identités et leurs dossiers.  
  Utilisé pour identifier la présence de comptes gérés par l'extension [Owl for Exchange](https://addons.thunderbird.net/en-us/thunderbird/addon/owl-for-exchange) et afficher un avertissement de dysfonctionnement tel qu'indiqué dans la section [Bug Owl for Exchange](#bug-owl-for-exchange), voir https://webextension-api.thunderbird.net/en/latest/accounts.html#permissions.
- compose : Lire et modifier vos messages électroniques lorsque vous les composez et envoyez.  
  Utilisé pour interagir avec la fenêtre de composition d'email (répondre ou créer un nouvel email), voir https://webextension-api.thunderbird.net/en/latest/compose.html#permissions.
- menus : Requis pour utiliser les fonctions `messenger.menus.*`.  
  Utilisé pour créer des menus personnalisés, voir https://webextension-api.thunderbird.net/en/latest/menus.html#permissions.
- messagesRead : Lire vos messages électroniques.  
  Utilisé pour lire le contenu d'un email existant dans la fenêtre de visualisation, voir https://webextension-api.thunderbird.net/en/latest/messages.html#permissions.
- messagesTagsList : Lister les étiquettes de messages Thunderbird disponibles.  
  Utilisé par la fonctionnalité Auto Tags pour récupérer les étiquettes existantes avant de demander à l'IA d'en choisir parmi elles, voir https://webextension-api.thunderbird.net/en/latest/messages.tags.html#permissions.
- messagesUpdate : Modifier les propriétés et étiquettes des messages.  
  Utilisé par la fonctionnalité Auto Tags pour appliquer les étiquettes sélectionnées par l'IA au message actuel, voir https://webextension-api.thunderbird.net/en/latest/messages.html#update-messageid-newproperties.
- messagesModify : Lire et modifier vos messages électroniques tels qu'ils vous sont affichés.  
  Utilisé pour modifier le contenu d'un email existant dans la fenêtre de visualisation, voir https://webextension-api.thunderbird.net/en/latest/messageDisplayScripts.html#permissions.
- sensitiveDataUpload : Le contenu des emails est envoyé au fournisseur de services LLM sélectionné pour traitement, basé sur vos choix dans les paramètres de l'extension.
- storage : Permet à l'extension de stocker et récupérer des données, et d'écouter les changements apportés aux éléments stockés.  
  Utilisé pour stocker les paramètres utilisateur, voir https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage.

## Localisation

L'extension a un petit ensemble de messages qui nécessitent une localisation. Si vous souhaitez étendre la traduction, le processus est simple :

1. Copiez le fichier `src/locales/en-messages.json` vers `src/locales/%CODE_ISO%-messages.json`, où `%CODE_ISO%` est votre code de langue [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).
2. Traduisez votre `src/locales/%CODE_ISO%-messages.json`, spécifiquement les propriétés `message`, et supprimez les propriétés `description`, qui ne sont utilisées que pour le contexte.
3. Ajoutez une nouvelle ligne dans le fichier `package.json`, correspondant aux autres entrées `build:locales-*` et en maintenant l'ordre alphabétique :

   ```json
   "build:locales-%CODE_ISO%": "node_modules/.bin/json-minify src/locales/%CODE_ISO%-messages.json > ai-mail-support/_locales/%CODE_ISO%/messages.json",
   ```
4. Ajoutez une entrée correspondante au script `build:locales` dans `package.json`, en maintenant également l'ordre alphabétique.
5. Ajoutez le dossier `%CODE_ISO%` à la clé `_locales` dans votre `src/manifest.json`.
6. Testez vos changements en utilisant le processus de construction décrit dans la section [Construction](#construction) et soumettez les changements dans une pull request.

## Licence et références

### Projet de Yellow Sakura

Ce projet est basé sur le travail original de Yellow Sakura, sous licence MIT.

[MIT](https://opensource.org/licenses/MIT) par [Yellow Sakura](https://www.yellowsakura.com), [support@yellowsakura.com](mailto:support@yellowsakura.com), voir le fichier LICENSE.  
Pour plus de détails, veuillez vous référer à la [page du projet](https://www.yellowsakura.com/en/projects/ai-mail-support-for-thunderbird) et au lien vers la page officielle [AMO (addons.mozilla.org)](https://addons.thunderbird.net/en-GB/thunderbird/addon/ai-mail-support).

### Évolution et maintenance du projet

Modifications et développement supplémentaire :

Copyright (c) 2026 Fabrice Simonet

### Dépendances :

* [ESLint](https://github.com/eslint/eslint) est sous licence [MIT License](https://opensource.org/licenses/MIT) ;
* [parcel](https://github.com/parcel-bundler/parcel) est sous licence [MIT License](https://opensource.org/licenses/MIT) ;
* [posthtml](https://github.com/posthtml/posthtml) est sous licence [MIT License](https://opensource.org/licenses/MIT) ;
* [remove-markdown](https://github.com/zuchka/remove-markdown) est sous licence [MIT License](https://opensource.org/licenses/MIT) ;
* [types/sanitize-html](https://github.com/apostrophecms/sanitize-html) est sous licence [MIT License](https://opensource.org/licenses/MIT) ;
* [types/thunderbird-webext-browser](https://www.npmjs.com/package/@types/thunderbird-webext-browser) est sous licence [MIT License](https://opensource.org/licenses/MIT) ;
* [typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint) est sous licence [BSD 2-clause license](https://opensource.org/license/bsd-2-clause).

Images :

* Icônes de robots dans `docs/bot-icon-*` créées par [Smashicons - Freepik](https://www.freepik.com/icon/bot_4712106)

CSS effects:

* Loader [Andrew Manzyk](https://uiverse.io/andrew-manzyk/young-walrus-64)

---

All trademarks mentioned are the property of their respective owners.