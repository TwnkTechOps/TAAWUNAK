# Frontend Dockerfile - Next.js
FROM node:20-slim AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Copy workspace package files
COPY apps/web-enterprise/package.json ./apps/web-enterprise/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Prisma schema (needed for build)
COPY apps/api/prisma ./apps/api/prisma

# Copy frontend source code
COPY apps/web-enterprise ./apps/web-enterprise

# Build the application
WORKDIR /app/apps/web-enterprise
RUN pnpm build

# Production image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

# Copy built application
# The standalone output includes everything needed
COPY --from=base --chown=nextjs:nodejs /app/apps/web-enterprise/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/apps/web-enterprise/.next/static ./apps/web-enterprise/.next/static
COPY --from=base --chown=nextjs:nodejs /app/apps/web-enterprise/public ./apps/web-enterprise/public

USER nextjs

EXPOSE 4320

ENV PORT=4320
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

