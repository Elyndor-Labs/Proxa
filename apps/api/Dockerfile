FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./

# Copy all packages
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install all deps (including dev)
RUN pnpm install --frozen-lockfile

# Build SDK first
RUN pnpm --filter @proxa/sdk build

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build API
RUN pnpm --filter @proxa/api build

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/index.js"]
