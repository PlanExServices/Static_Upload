FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY server.js ./
COPY delquro-files-pro.html ./
COPY index.html ./
COPY data ./data

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server.js"]
