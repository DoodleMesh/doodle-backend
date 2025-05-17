FROM node:21.7.3

WORKDIR /app

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm prisma generate

EXPOSE 3002

CMD ["pnpm", "run", "dev"]
