@echo off
if not exist data mkdir data
python sync_content.py
powershell -Command "Write-Host 'Pianospark & Chordspark Sync v1.6 Success' -ForegroundColor Yellow"
pause
