FROM node:20-bullseye-slim

WORKDIR /usr/src/app

# Install deps
COPY package.json yarn.lock* ./
COPY prisma ./prisma
RUN apt-get update \
    && apt-get install -y python3 make g++ libc6-dev libssl-dev ca-certificates postgresql-client --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
RUN yarn install --frozen-lockfile || yarn install

# Copy source
COPY . ./

# Generate Prisma client so @prisma/client is available during build (fail fast if this fails)
RUN npx prisma generate

# Build
RUN yarn build

# Add entrypoint which will seed admin and then start the app
COPY scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
