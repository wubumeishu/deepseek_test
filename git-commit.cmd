@echo off
rem 一键提交当前改动。用法: git-commit.cmd "feat: xxx" 或 git-commit.cmd（自动生成）
cd /d "%~dp0"
if not exist .git ( echo 尚未 git init，请先运行 git-init.cmd & exit /b 1 )
set "MSG=%~1"
if "%MSG%"=="" (
  for /f "delims=" %%f in ('git diff --name-only ^& git ls-files --others --exclude-standard') do if not defined _FILES set "_FILES=%%f" else set "_FILES=%_FILES%,%%f"
  if defined _FILES set "MSG=chore: update files: %_FILES%"
  if not defined MSG set "MSG=chore: commit"
)
git add -A
git commit -m "%MSG%"
echo === 已提交 ===
git log --oneline -1
echo === 状态 ===
git status --short
