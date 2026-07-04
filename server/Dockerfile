FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3001

# Tighten to production mode
ENV NODE_ENV=production

CMD ["node", "index.js"]
