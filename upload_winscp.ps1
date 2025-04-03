# Script para upload via WinSCP
$ftpHost = "82.25.72.132"
$ftpUser = "u366262974"
$ftpPass = "454799Wonka@"
$localPath = "C:\Users\steve\Documents\third\test\dist\*"

# Crear archivo de script para WinSCP
$scriptContent = @"
option batch abort
option confirm off
open ftp://${ftpUser}:${ftpPass}@${ftpHost}
cd /
put -nopreservetime -nopermissions $localPath
exit
"@

$scriptPath = "winscp_script.txt"
$scriptContent | Out-File -FilePath $scriptPath -Encoding ASCII

# Ejecutar WinSCP
Write-Host "🚀 Iniciando upload con WinSCP..." -ForegroundColor Cyan
winscp.com /script=$scriptPath

# Limpiar archivo de script
Remove-Item $scriptPath

Write-Host "`n✨ Proceso de upload finalizado" -ForegroundColor Green
Write-Host "🌐 Visite http://boo-bets.net para ver el sitio" -ForegroundColor Cyan 