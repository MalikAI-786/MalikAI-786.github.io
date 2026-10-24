FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY sql ./sql
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
# no root
USER node
CMD ["node", "src/index.js"]
