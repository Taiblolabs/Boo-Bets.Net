# Script para upload via WebClient
$ftpUrl = "ftp://82.25.72.132"
$username = "u366262974"
$password = "454799Wonka@"
$localPath = "C:\Users\steve\Documents\third\test\dist"

# Función para subir archivo
function Upload-FileToFtp {
    param (
        [string]$localFile,
        [string]$remoteFile
    )
    
    try {
        $webclient = New-Object System.Net.WebClient
        $webclient.Credentials = New-Object System.Net.NetworkCredential($username, $password)
        
        Write-Host "📤 Subiendo $localFile..." -ForegroundColor Yellow
        $uri = New-Object System.Uri("$ftpUrl/$remoteFile")
        $webclient.UploadFile($uri, $localFile)
        Write-Host "✅ $localFile subido correctamente" -ForegroundColor Green
        
        $webclient.Dispose()
        return $true
    }
    catch {
        Write-Host "❌ Error al subir $localFile : $_" -ForegroundColor Red
        return $false
    }
}

Write-Host "🚀 Iniciando proceso de upload..." -ForegroundColor Cyan

# Subir index.html
Upload-FileToFtp "$localPath\index.html" "index.html"

# Subir vite.svg
if (Test-Path "$localPath\vite.svg") {
    Upload-FileToFtp "$localPath\vite.svg" "vite.svg"
}

# Subir archivos de assets
$assetsPath = Join-Path $localPath "assets"
if (Test-Path $assetsPath) {
    $assetsFiles = Get-ChildItem -Path $assetsPath -File
    foreach ($file in $assetsFiles) {
        $uploaded = Upload-FileToFtp $file.FullName "assets/$($file.Name)"
        if (-not $uploaded) {
            Write-Host "🔄 Reintentando subida de $($file.Name)..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
            Upload-FileToFtp $file.FullName "assets/$($file.Name)"
        }
    }
}

Write-Host "`n✨ Proceso de upload finalizado" -ForegroundColor Green
Write-Host "🌐 Visite http://boo-bets.net para ver el sitio" -ForegroundColor Cyan 