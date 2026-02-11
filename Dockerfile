FROM oven/bun:1.3.5

WORKDIR /app
ENV NODE_ENV=production

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production

COPY . .

USER bun
EXPOSE 3030
CMD ["/usr/local/bin/bun", "src/index.ts"]