FROM node:20-slim
RUN apt-get update && apt-get install -y ghostscript libreoffice-writer libreoffice-calc libreoffice-impress && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN mkdir -p /app/uploads
EXPOSE 5000
CMD ["node", "src/server.js"]
