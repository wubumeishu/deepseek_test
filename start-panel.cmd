@echo off
chcp 65001 >nul
cd /d "%~dp0"
set PORT=4173

if not exist "dist\index.html" (
  echo [compony] 首次运行，正在构建前端面板...
  call npm run build:panel || goto :fail
)

echo [compony] 面板地址: http://127.0.0.1:%PORT%/
echo [compony] 关闭此窗口即停止服务。
node static-server.mjs
goto :eof

:fail
echo [compony] 构建失败，请检查 Node 环境后重试。
pause
