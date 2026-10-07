# Confidentialité — AI Mail Extended

L’extension traite les textes à votre demande avec le fournisseur IA que vous configurez.

Selon l’action choisie, elle transmet le texte sélectionné, le contenu du message ou du brouillon et son objet, les instructions de traitement, vos prompts personnalisés, et éventuellement les noms des étiquettes pour Auto Tags. L’affinage transmet également la réponse précédente et votre nouvelle instruction. Les demandes de synthèse vocale transmettent le texte à lire. Les clés API ou tokens servent à authentifier les demandes auprès du service configuré.

Les modèles peuvent être interrogés lors de leur actualisation et une demande de test est envoyée lorsque vous testez la connexion dans les options. Les réglages et identifiants sont enregistrés avec l’API de stockage de Thunderbird (`storage.sync`) ; le comportement de synchronisation dépend de Thunderbird.

Le développeur de l’extension ne reçoit pas ces données : les demandes vont directement au fournisseur ou au serveur configuré. Aucun service de télémétrie ou de publicité n’est intégré à l’extension. Le fournisseur distant applique ses propres conditions de conservation et de traitement ; consultez-les avant de lui confier des messages sensibles. Avec un serveur exécuté sur votre ordinateur, les demandes sont adressées à ce serveur local.

Le masquage facultatif des données personnelles repose sur des heuristiques et ne garantit pas l’anonymisation de tous les textes envoyés. Pour cesser les transmissions, n’utilisez plus les actions IA, supprimez les identifiants et URL enregistrés, ou désinstallez l’extension. La suppression de l’extension ne supprime pas les données déjà reçues par un fournisseur.

Pour la publication sur addons.thunderbird.net, copier le texte de cette notice dans le champ de confidentialité du portail.
