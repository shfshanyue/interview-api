# 选择一个体积小的镜像 (~5MB)
FROM node:16-alpine

WORKDIR /code

RUN npm i -g pnpm --registry=https://registry.npmmirror.com

# 更好的根据 Image Layer 利用缓存
ADD package.json pnpm-lock.yaml ./
RUN pnpm i --prod --registry=https://registry.npmmirror.com

ADD . /code
RUN npm run build

EXPOSE 4000

CMD node index.js
