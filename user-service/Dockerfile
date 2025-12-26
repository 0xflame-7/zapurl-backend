FROM node:22-alpine
RUN corepack enable

WORKDIR /app

# copy config files from root
COPY .prettierrc .
COPY eslint.config.mjs .
COPY .prettierignore .
COPY tsconfig.base.json .

# copy packages
COPY shared ./shared
COPY user-service ./user-service

# build shared
WORKDIR /app/shared
RUN pnpm install 
RUN pnpm run build

# build user-service
WORKDIR /app/user-service
RUN pnpm install 
RUN pnpm run build

EXPOSE 4001
CMD ["node", "dist/index.js"]
