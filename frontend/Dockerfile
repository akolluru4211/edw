# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies using package-lock cache optimizations
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Accept build-time API base URL and set env for Next.js compilation
ARG NEXT_PUBLIC_API_URL=http://localhost:5000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js production bundle
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built bundles, static assets and next config from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3001
ENV PORT=3001

# Boot Next.js production server
CMD ["npm", "run", "start"]
