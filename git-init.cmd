@echo off
rem Windows CMD：在 I:\deepseek\compony 初始化 git 并完成首次提交
cd /d "%~dp0"
git init -b main
git config user.name "compony-dev"
git config user.email "compony-dev@local"
git add -A
git commit -m "feat: 公司多智能体协同系统初版（引擎+UI+DSH插件+测试）"
echo === git log ===
git log --oneline
echo === git status ===
git status
