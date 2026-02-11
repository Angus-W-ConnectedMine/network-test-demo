FROM oven/bun:1.1.0-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package.json bun.lockb ./

RUN bun install --frozen-lockfile --production

COPY . .

RUN useradd -m -u 10001 bunapp
USER bunapp

EXPOSE 3000

CMD ["bun", "run", "start"]
