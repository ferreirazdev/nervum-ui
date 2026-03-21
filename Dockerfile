# syntax=docker/dockerfile:1
# Cloud Run: connect repo → choose this Dockerfile → set env VITE_API_BASE_URL to your public API base (e.g. https://api.example.com/api/v1).
# Optional: PORT is injected by Cloud Run; entrypoint rewrites nginx listen.

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm (do not set NODE_ENV=production before install — Vite/Tailwind live in devDependencies)
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build with a placeholder so the real URL can be injected at container startup
RUN VITE_API_BASE_URL=__VITE_API_BASE_URL_PLACEHOLDER__ pnpm run build

# Runtime stage
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

# Cloud Run requires port 8080
EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]
