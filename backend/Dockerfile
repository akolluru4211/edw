# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies using package-lock cache optimizations
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code and build TypeScript
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built code, Prisma schema and generated client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 5000

# Align SQLite database schema on startup and launch backend server
CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]
