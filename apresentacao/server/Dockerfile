FROM node:18-alpine

# Metadados
LABEL maintainer="fabio.leites@gmail.com"
LABEL description="WebSocket signaling server — Vinícola-Modelo & Lean presentation remote control"

WORKDIR /app

# Instala dependências primeiro (camada cacheável)
COPY package.json ./
RUN npm install --production --no-fund --no-audit

# Copia o código da aplicação
COPY index.js ./

# Porta padrão
EXPOSE 8080

# Health check básico
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080 || exit 1

CMD ["node", "index.js"]
