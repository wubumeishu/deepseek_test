# Windows PowerShell：在 I:\deepseek\compony 初始化 git 并完成首次提交（幂等，可重复跑）
Set-Location -LiteralPath $PSScriptRoot
if (-not (Test-Path .git)) {
    git init -b main
    git config user.name  "compony-dev"
    git config user.email "compony-dev@local"
}
git add -A
$null = git log --oneline 2>&1
if ($LASTEXITCODE -ne 0) {
    git commit -m "feat: 公司多智能体协同系统初版（引擎+UI+DSH插件+测试）"
} else {
    Write-Host "仓库已存在，本次改动请用 .\git-commit.cmd "
}
Write-Host "=== git log ==="
git log --oneline
Write-Host "=== git status ==="
git status --short
