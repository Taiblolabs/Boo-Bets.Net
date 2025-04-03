# Script simple para upload via FTP usando WebClient
$ftpUrl = "ftp://82.25.72.132"
$username = "u366262974"
$password = "454799Wonka@"
$localPath = "C:\Users\steve\Documents\third\test\dist"

# Crear objeto WebClient
$webClient = New-Object System.Net.WebClient
$webClient.Credentials = New-Object System.Net.NetworkCredential($username, $password)

Write-Host "🚀 Iniciando upload..." -ForegroundColor Cyan

# Subir index.html
try {
    Write-Host "📄 Subiendo index.html..." -ForegroundColor Yellow
    $webClient.UploadFile("$ftpUrl/index.html", "$localPath\index.html")
    Write-Host "✅ index.html subido correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al subir index.html: $_" -ForegroundColor Red
}

# Subir vite.svg
try {
    Write-Host "🖼️ Subiendo vite.svg..." -ForegroundColor Yellow
    $webClient.UploadFile("$ftpUrl/vite.svg", "$localPath\vite.svg")
    Write-Host "✅ vite.svg subido correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al subir vite.svg: $_" -ForegroundColor Red
}

# Crear directorio assets
try {
    $ftpRequest = [System.Net.FtpWebRequest]::Create("$ftpUrl/assets")
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($username, $password)
    $response = $ftpRequest.GetResponse()
    Write-Host "✅ Directorio assets creado" -ForegroundColor Green
    $response.Close()
} catch {
    Write-Host "ℹ️ El directorio assets ya existe o no se pudo crear" -ForegroundColor Yellow
}

# Subir archivos de assets
$assetsPath = Join-Path $localPath "assets"
if (Test-Path $assetsPath) {
    $assetsFiles = Get-ChildItem -Path $assetsPath -File
    foreach ($file in $assetsFiles) {
        try {
            Write-Host "📦 Subiendo $($file.Name)..." -ForegroundColor Yellow
            $webClient.UploadFile("$ftpUrl/assets/$($file.Name)", $file.FullName)
            Write-Host "✅ $($file.Name) subido correctamente" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error al subir $($file.Name): $_" -ForegroundColor Red
            # Reintentar una vez más
            try {
                Write-Host "🔄 Reintentando subida de $($file.Name)..." -ForegroundColor Yellow
                Start-Sleep -Seconds 2
                $webClient.UploadFile("$ftpUrl/assets/$($file.Name)", $file.FullName)
                Write-Host "✅ $($file.Name) subido correctamente en el segundo intento" -ForegroundColor Green
            } catch {
                Write-Host "❌ Error al subir $($file.Name) en el segundo intento: $_" -ForegroundColor Red
            }
        }
    }
}

$webClient.Dispose()
Write-Host "`n✨ Proceso de upload finalizado" -ForegroundColor Green
Write-Host "🌐 Visite http://boo-bets.net para ver el sitio" -ForegroundColor Cyan 