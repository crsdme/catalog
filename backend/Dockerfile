FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/

RUN npm ci --workspace @catalog/shared --workspace backend --include-workspace-root

COPY packages/shared ./packages/shared
COPY backend ./backend

RUN npm run build -w @catalog/shared \
  && npm run build -w backend

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/

RUN npm ci --workspace @catalog/shared --workspace backend --include-workspace-root --omit=dev \
  && npm install drizzle-kit --no-save

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY backend/drizzle.config.ts ./backend/drizzle.config.ts
COPY backend/src/db ./backend/src/db
COPY backend/docker-entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh \
  && mkdir -p /app/backend/storage/cache/drive /app/backend/storage/uploads /app/backend/storage/temp

WORKDIR /app/backend

EXPOSE 5000

ENTRYPOINT ["/entrypoint.sh"]
