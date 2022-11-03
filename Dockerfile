# 选择一个体积小的镜像 (~5MB)
FROM node:16-alpine

WORKDIR /code

# 更好的根据 Image Layer 利用缓存
ADD package.json yarn.lock ./
RUN yarn --registry=https://registry.npmmirror.com

ADD . /code
RUN npm run build

EXPOSE 4000

CMD node index.js
