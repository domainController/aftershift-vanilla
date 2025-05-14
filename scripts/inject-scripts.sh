#!/bin/zsh

echo "Injecting standard <script> block into all HTML files..."

for file in $(find . -name "*.html"); do
  echo "Processing $file"

  # Supprimer les anciens blocs <script> (multilignes)
  sed -i '' '/<script>/,/<\/script>/d' "$file"

  # Insérer le nouveau bloc juste avant </body>
  sed -i '' '/<\/body>/i\
<script>\
  // Script pour la sidebar\
  const toggleBtn = document.getElementById("toggleNavbar");\
  const navbar = document.querySelector(".navbar");\
  toggleBtn?.addEventListener("click", () => {\
    navbar.classList.toggle("collapsed");\
  });\
\
  // Script pour injecter le footer\
  fetch("/components/footer.html")\
    .then(res => res.text())\
    .then(html => {\
      const footerContainer = document.createElement("div");\
      footerContainer.innerHTML = html;\
      document.body.appendChild(footerContainer);\
    });\
</script>' "$file"
done

echo "✅ Injection complete."