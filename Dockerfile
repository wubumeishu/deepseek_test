# Compony 多智能体协同平台 —— 单容器交付（M4）
#
# 设计前提：
#   - apps/server 零第三方依赖（仅 node 内置 http + node:sqlite），用
#     Node 24 --experimental-strip-types 直接跑 TS，无需安装。
#   - 面板构建需要 vite/react（第三方），从 npm 安装。
#   - 引擎（packages/engine）被 server 以相对路径引用，随源码拷入，
#     不需要 workspace 链接。
#
# 因此镜像只需：拷贝源码 + npm install 面板前端依赖 + vite build。
# 不依赖 pnpm / workspace 协议（npm install 在根 package.json 的
# workspace:* 上会失败，但 server 不用它，只需面板依赖）。

FROM node:24-slim

WORKDIR /app

# 拷贝源码（server + engine + 面板 + 脚本 + 冒烟）
COPY packages/engine ./packages/engine
COPY packages/protocol ./packages/protocol
COPY apps/server ./apps/server
COPY adapters/http ./adapters/http
COPY src ./src
COPY vite.config.ts tsconfig.json ./
COPY engine-smoke.mjs .
COPY static-server.mjs .

# 安装面板前端依赖（react / vite / tsx 等）。
# 根 package.json 的 workspace:* 依赖 npm 无法解析，故显式只装前端运行所需包，
# 不跑全量 npm install。server 侧零依赖，不受影响。
COPY package.json ./
RUN npm install \
    react react-dom react-router-dom zustand \
    vite @vitejs/plugin-react typescript tsx \
    --no-audit --no-fund --legacy-peer-deps \
    || echo "panel deps install failed (offline?) -- server 仍可启动"

# 构建面板静态产物（vite build -> dist/）。
# 若网络不可用导致安装失败，面板构建跳过，API 仍可用。
RUN npm run build:panel \
    || echo "panel build skipped -- API 模式仍可用"

# SQLite 数据卷（持久化）
VOLUME ["/data"]
ENV COMPONY_DB=/data/compony.sqlite \
    COMPONY_PORT=4174 \
    PORT=4173 \
    COMPONY_API_PORT=4174

# 暴露：面板静态（4173，含 /api 反向代理）+ API 服务（4174）
EXPOSE 4173 4174

# 先起 API 服务（宿主解耦：无需 DSH），再起面板静态 + 反向代理。
# 若 dist/ 不存在（面板构建失败），static-server 仅代理 /api。
CMD ["sh", "-c", "node --experimental-strip-types apps/server/src/index.ts & sleep 1; node static-server.mjs"]
