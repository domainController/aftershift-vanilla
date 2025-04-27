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
