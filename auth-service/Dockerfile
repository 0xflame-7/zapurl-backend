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
COPY auth-service ./auth-service

# build shared
WORKDIR /app/shared
RUN pnpm install 
RUN pnpm run build

# build auth-service
WORKDIR /app/auth-service
RUN pnpm install 
RUN pnpm run build

EXPOSE 4000
CMD ["node", "dist/index.js"]
