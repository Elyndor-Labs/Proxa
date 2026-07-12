FROM node:20-slim

RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @proxa/sdk build

RUN cd apps/api && npx prisma generate

RUN pnpm --filter @proxa/api build

EXPOSE 3001

CMD ["node", "/app/apps/api/dist/index.js"]
