# Script para upload via FTP nativo
$ftpScript = @"
open 82.25.72.132
u366262974
454799Wonka@
binary
cd /
mkdir assets
cd assets
mput dist\assets\*
cd ..
mput dist\*
quit
"@

# Guardar script FTP
$ftpScript | Out-File -FilePath "ftp_commands.txt" -Encoding ASCII

Write-Host "🚀 Iniciando upload con FTP nativo..." -ForegroundColor Cyan
ftp -s:ftp_commands.txt

# Limpiar archivo de script
Remove-Item "ftp_commands.txt"

Write-Host "`n✨ Proceso de upload finalizado" -ForegroundColor Green
Write-Host "🌐 Visite http://boo-bets.net para ver el sitio" -ForegroundColor Cyan 