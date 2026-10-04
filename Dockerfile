# Compony 多智能体协同平台 —— 单容器交付（M4）
# Node 24 内置 node:sqlite，零第三方原生依赖，无需 node-gyp。
FROM node:24-slim

WORKDIR /app

# 先拷贝 workspace 清单与包描述文件（利用 Docker 层缓存）
COPY pnpm-workspace.yaml package.json ./
COPY packages/engine/package.json ./packages/engine/
COPY packages/protocol/package.json ./packages/protocol/
COPY apps/server/package.json ./apps/server/
COPY adapters/dsh/package.json ./adapters/dsh/
COPY adapters/http/package.json ./adapters/http/

# 安装依赖（仅生产所需；server 零第三方依赖，实际无额外包）
RUN npm install --no-audit --no-fund || true

# 拷贝源码
COPY packages ./packages
COPY apps/server ./apps/server
COPY adapters/dsh ./adapters/dsh
COPY adapters/http ./adapters/http
COPY src ./src
COPY engine-smoke.mjs .
COPY static-server.mjs .

# 构建面板静态产物（Vite）+ DSH 适配器（tsdown）
RUN npm run build:panel && npm run build

# SQLite 数据卷（持久化）
VOLUME ["/data"]
ENV COMPONY_DB=/data/compony.sqlite \
    COMPONY_PORT=4174 \
    PORT=4173 \
    COMPONY_API_PORT=4174

# 暴露：面板静态（4173，含 /api 反向代理）+ API 服务（4174）
EXPOSE 4173 4174

# 先起 API 服务（宿主解耦：无需 DSH），再起面板静态+代理
CMD ["sh", "-c", "node --experimental-strip-types apps/server/src/index.ts & sleep 1; node static-server.mjs"]
