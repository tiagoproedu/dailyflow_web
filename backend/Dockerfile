FROM node:22-alpine

WORKDIR /app

# Instala as dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./
RUN npm ci --omit=dev

# O Prisma compila um binário por sistema operacional, por isso o generate roda aqui
COPY prisma ./prisma
RUN npx prisma generate

COPY server.js ./
COPY src ./src

EXPOSE 3001
CMD ["node", "server.js"]
