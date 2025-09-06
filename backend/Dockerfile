FROM node:20-alpine AS base
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Runtime
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

