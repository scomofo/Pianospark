$targetDir = ".\data"
if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir }
Write-Host "PowerShell Sync: Environment Verified." -ForegroundColor Green
