#!/bin/sh
# Linux/macOS：幂等初始化 git 仓库
cd "$(dirname "$0")"
[ -d .git ] || { git init -b main; git config user.name "compony-dev"; git config user.email "compony-dev@local"; }
git add -A
if git log --oneline >/dev/null 2>&1; then
  echo "仓库已存在，本次改动请用 git commit"
else
  git commit -m "feat: 公司多智能体协同系统初版（引擎+UI+DSH插件+测试）"
fi
git log --oneline
git status --short
