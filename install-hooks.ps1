# 安装 git 钩子（clone 后跑一次）
$ErrorActionPreference = "Stop"
$root = (git rev-parse --show-toplevel)
$hook = Join-Path $root ".git/hooks/pre-commit"
$content = @'
#!/bin/sh
cd "$(git rev-parse --show-toplevel)" || exit 1
echo "测试守护: lint + test + smoke..."
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:full || { echo "红灯拦截"; exit 1; }
exit 0
'@
Set-Content -Path $hook -Value $content -Encoding ascii
& (Join-Path $root ".git") | Out-Null
Write-Host "pre-commit 钩子已安装到 $hook"
