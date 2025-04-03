# Script simple para desplegar archivos a Hostinger vía FTP

$ftpHost = "82.25.72.132"
$ftpUser = "u366262974"
$ftpPass = "454799Wonka@"
$ftpPath = "/public_html/boo-bets.net"  # Sin barra al final

# Crear un objeto WebClient para FTP
$webClient = New-Object System.Net.WebClient
$webClient.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)

Write-Host "Iniciando despliegue a Hostinger..." -ForegroundColor Yellow

# Crear directorio si no existe
Write-Host "Verificando directorio de destino..." -ForegroundColor Yellow
try {
    $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost$ftpPath")
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $ftpRequest.GetResponse() | Out-Null
    Write-Host "Directorio creado correctamente" -ForegroundColor Green
} catch {
    Write-Host "El directorio ya existe o no se pudo crear (esto es normal)" -ForegroundColor Yellow
}

# Subir el archivo index.html
Write-Host "Subiendo index.html..." -ForegroundColor Yellow
try {
    $webClient.UploadFile("ftp://$ftpHost$ftpPath/index.html", (Resolve-Path ".\dist\index.html").Path)
    Write-Host "index.html subido exitosamente" -ForegroundColor Green
} catch {
    Write-Host "Error al subir index.html: $($_.Exception.Message)" -ForegroundColor Red
}

# Subir el archivo vite.svg
Write-Host "Subiendo vite.svg..." -ForegroundColor Yellow
try {
    $webClient.UploadFile("ftp://$ftpHost$ftpPath/vite.svg", (Resolve-Path ".\dist\vite.svg").Path)
    Write-Host "vite.svg subido exitosamente" -ForegroundColor Green
} catch {
    Write-Host "Error al subir vite.svg: $($_.Exception.Message)" -ForegroundColor Red
}

# Subir los archivos de assets
Write-Host "Creando directorio assets..." -ForegroundColor Yellow
try {
    $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost$ftpPath/assets")
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $ftpRequest.GetResponse() | Out-Null
    Write-Host "Directorio assets creado correctamente" -ForegroundColor Green
} catch {
    Write-Host "El directorio assets ya existe o no se pudo crear (esto es normal)" -ForegroundColor Yellow
}

# Obtener todos los archivos de la carpeta assets
$assets = Get-ChildItem -Path ".\dist\assets" -File

# Subir cada archivo de assets
foreach ($asset in $assets) {
    Write-Host "Subiendo $($asset.Name)..." -ForegroundColor Yellow
    try {
        $webClient.UploadFile("ftp://$ftpHost$ftpPath/assets/$($asset.Name)", $asset.FullName)
        Write-Host "$($asset.Name) subido exitosamente" -ForegroundColor Green
    } catch {
        Write-Host "Error al subir $($asset.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "¡Despliegue completado!" -ForegroundColor Green
Write-Host "La aplicación estará disponible en: https://boo-bets.net" -ForegroundColor Cyan 