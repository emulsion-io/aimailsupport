# Publication 1.8.0

- Identifiant conservé : `fabrice@emulsion.io`.
- Manifest V2, Thunderbird 128 minimum.
- Streaming désactivé par défaut ; les réglages existants sont conservés.
- Fonctionnement dans Thunderbird confirmé par l’utilisateur sur la branche dev avant préparation de la release.
- XPI : `dist/ai-mail-extended-1.8.0.xpi`.
- Sources : `dist/ai-mail-extended-1.8.0-sources.zip`, avec instructions de reconstruction.
- Confidentialité : copier le texte de `PRIVACY.md` dans le champ du portail ATN.
- Vérifications de release : 42 tests réussis, ESLint et TypeScript sans erreur, construction réussie, intégrité du XPI et de DOMPurify vérifiée.
- addons-linter 10.13.0 : 0 erreur, 0 notice, 9 avertissements, détaillés ci-dessous.
- Reconstruction indépendante : `npm ci`, compilation depuis l’archive source et comparaison fichier par fichier du XPI réussies. Un ancien bundle inutilisé a été retiré du paquet.

## Notes pour la revue

Le validateur local addons-linter est orienté Firefox. Son résultat ne remplace pas la revue de addons.thunderbird.net.

Les sept avertissements `MANIFEST_PERMISSIONS` concernent des permissions Thunderbird utilisées : lecture des comptes pour Owl, composition, lecture des messages, liste et mise à jour des étiquettes, scripts d’affichage et transmission au fournisseur IA sélectionné. Elles sont conservées conformément à la [documentation Thunderbird MV2](https://webextension-api.thunderbird.net/en/mv2/permissions.html).

`MISSING_DATA_COLLECTION_PERMISSIONS` demande une déclaration liée au dispositif Firefox. La version minimale reste Thunderbird 128 ; cette release conserve `sensitiveDataUpload` et explicite les transmissions dans les options et la notice de confidentialité. Aucun `required: ["none"]` trompeur n’est ajouté : les actions IA transmettent bien des communications personnelles. Vérifier les éventuelles demandes spécifiques du portail ATN au dépôt.

`UNSAFE_VAR_ASSIGNMENT` se situe dans la distribution officielle DOMPurify, non modifiée. `VENDOR.md` référence le fichier exact et sa version. Le HTML affiché par l’extension est nettoyé par DOMPurify. Le [guide de revue Thunderbird](https://addons-reviewer-guide.thunderbird.net/add-on-review-guide) accepte cet usage et distingue les bibliothèques reconnues du code de l’extension.

Le code TypeScript est compilé et minifié par Parcel. Joindre l’archive source conformément aux [instructions ATN](https://webextension-api.thunderbird.net/en/mv2/guides/sourceCodeSubmission.html). Le lockfile identifie aussi les dépendances intégrées aux bundles.

La validation et les empreintes du paquet final sont conservées dans `dist/ai-mail-extended-1.8.0-validation.json` et `dist/ai-mail-extended-1.8.0-SHA256.txt`.
