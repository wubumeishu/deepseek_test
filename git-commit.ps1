# 一键提交当前改动（自动生成提交信息）。用法：
#   .\git-commit.ps1 "feat: 新增会议室视图"
# 不带参数则自动根据 diff 生成信息。
Set-Location -LiteralPath $PSScriptRoot
if (-not (Test-Path ".git")) { Write-Error "尚未 git init，请先运行 .\git-init.ps1"; exit 1 }

$msg = $args[0]
if (-not $msg) {
  # 根据改动文件生成约定式提交信息
  $changed = (git diff --name-only; git ls-files --others --exclude-standard) | Where-Object { $_ -and $_ -notmatch "^\.git/" } | Select-Object -Unique
  if (-not $changed) { Write-Host "没有改动可提交"; exit 0 }
  $files = ($changed -join ", ")
  $msg = "chore: update " + $changed.Count + " file(s): " + $files.Substring(0, [Math]::Min(80, $files.Length))
}

git add -A
git commit -m $msg
Write-Host "=== 已提交 ==="
git log --oneline -1
Write-Host "=== 状态 ==="
git status --short
