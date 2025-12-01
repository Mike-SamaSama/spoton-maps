<#
  PowerShell script to install tracked hooks into the local .git/hooks directory.
  Run: powershell -ExecutionPolicy Bypass -File .\scripts\install-hooks.ps1
#>

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$hookSrc = Join-Path $repoRoot "hooks\post-commit"
$gitHookDir = Join-Path $repoRoot "..\.git\hooks"

if (-not (Test-Path $gitHookDir)) {
  Write-Error ".git/hooks directory not found. Are you in the repository?"
  exit 1
}

$dest = Join-Path $gitHookDir "post-commit"

Copy-Item -Path $hookSrc -Destination $dest -Force

# Ensure permissions (on Unix-like environments)
if (-not ($IsWindows)) {
  & chmod +x $dest 2>$null
}

Write-Host "✅ Installed post-commit hook to $dest"
Write-Host "Note: Ensure your Git credentials (SSH key or credential helper) are configured so hooks can push without prompting."
