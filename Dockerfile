# Utiliser l'image officielle de Caddy
FROM caddy:latest

# Copier les fichiers de l'application dans le répertoire par défaut de Caddy
COPY src/* /usr/share/caddy/

# Copier le Caddyfile pour configurer le serveur
COPY Caddyfile /etc/caddy/Caddyfile

