# syntax=docker/dockerfile:1.4

FROM backend AS backend_order

FROM node:20-alpine AS builder
RUN --mount=from=backend_order,target=/backend-ready,readonly \
    test -d /backend-ready

WORKDIR /app

ARG VITE_BACKEND_URL=
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY frontend/package.json ./frontend/

RUN npm ci --workspace @catalog/shared --workspace frontend --include-workspace-root

COPY packages/shared ./packages/shared
COPY frontend ./frontend

RUN npm run build -w @catalog/shared \
  && npm run build -w frontend

FROM nginx:alpine AS runner

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
