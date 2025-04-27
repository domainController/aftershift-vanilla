Ce répertoire contient trois scripts Node.js modernes (.mjs = module ES6)
utilisés pour automatiser l’affichage et la traçabilité des mises à jour techniques du site.

Les scripts fonctionnent ensemble, automatiquement, à chaque git push, grâce à Husky,
qui agit comme un manager moderne de hooks Git.

⸻

Détail des trois scripts

1. scripts/add-timestamps.mjs

Mission :
Met à jour ou ajoute automatiquement un horodatage (Last updated:...) sur chaque fichier HTML modifié.

Principe :
• Seuls les fichiers HTML réellement modifiés sont mis à jour.
• L’horodatage est inséré juste après le premier <h1>.
• L’heure et la date reflètent le moment réel du git push, garantissant la transparence publique.

Attention :
• Pour que le script sache quels fichiers vérifier, il faut alimenter le hook .husky/pre-push avec la bonne variable TARGET_FILES.
• Exemple dans pre-push : TARGET_FILES="index.html updates.html home.html timeline.html"

⸻

2. scripts/generate-home-updates.mjs

Mission :
Injecte automatiquement dans index.html un extrait des mises à jour réalisées sur les dernières 24 heures (1 jour).

Principe :
• Scanne tous les commits récents via Git.
• Génère un petit bloc HTML inséré entre les marqueurs <!-- START INDEX UPDATES --> ... <!-- END INDEX UPDATES --> dans la homepage.
• Permet au visiteur de voir immédiatement l’activité technique récente.

⸻

3. scripts/generate-updates.mjs

Mission :
Génère ou régénère une page complète (updates.html) listant toutes les activités sur les 10 derniers jours.

Principe :
• Regroupe les commits par jour.
• Affiche pour chaque jour : heure, type d’action, titre du commit.
• Met en forme un historique clair et accessible pour tout visiteur ou toute inspection externe.

⸻

Enchaînement logique au moment d’un git push

Chaque git push déclenche : 1. Détection des fichiers HTML modifiés (git diff --cached) 2. Mise à jour automatique des timestamps (add-timestamps.mjs) 3. Regénération de l’extrait d’updates pour index.html (generate-home-updates.mjs) 4. Regénération complète de la page updates.html (generate-updates.mjs) 5. Ajout automatique (git add) des fichiers modifiés par les scripts.

Ainsi, l’ensemble du site est toujours cohérent, transparent et traçable à chaque push vers GitHub.

⸻

Notes complémentaires
• Tous les scripts sont écrits en Node.js moderne (format .mjs avec import/export natif).
• Husky (créé par Typicode en 2017) est utilisé pour automatiser le lancement de ces scripts via un hook pre-push.
• L’approche garantit que ce qui est publié en ligne correspond fidèlement au travail effectué localement, sans besoin d’intervention manuelle supplémentaire.

[ TU FAIS UN GIT PUSH ]

      |
      v

[ .husky/pre-push déclenché ]

      |
      v

[ 1. Cherche les fichiers .html modifiés (avec TARGET_FILES à jour) ]

      |
      v

[ 2. Si des fichiers modifiés ➔ add-timestamps.mjs met à jour leur horodatage (Last updated) ]

      |
      v

[ 3. Lance scripts/generate-home-updates.mjs ]
➔ Génère les updates récents pour homepage (1 jour)

      |
      v

[ 4. Lance scripts/generate-updates.mjs ]
➔ Génère la page complète d'historique sur 10 jours

      |
      v

[ 5. git add automatique des fichiers modifiés (timestamps + home.html + updates.html) ]

      |
      v

[ 6. Push final vers GitHub ]

✅ Résultat : tout est propre, cohérent, à jour au moment où c’est rendu public.
