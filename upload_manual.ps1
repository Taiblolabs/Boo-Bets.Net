# Script simplificado para subir archivos al servidor FTP
$ftpUrl = "ftp://82.25.72.132"
$localPath = "C:\Users\steve\Documents\third\test\dist"
$remotePath = ""  # Usar la raíz del servidor

# Obtener credenciales de variables de entorno
$ftpUsername = "u366262974"  # Hardcoded para evitar problemas con variables de entorno
$ftpPassword = "454799Wonka@"

# Verificar si el directorio dist existe
if (-not (Test-Path $localPath)) {
    Write-Host "Error: El directorio dist no existe. Ejecute 'npm run build' primero." -ForegroundColor Red
    exit 1
}

# Función para listar directorios
function List-Directory {
    param (
        [string]$path
    )
    try {
        $uri = New-Object System.Uri("$ftpUrl$path")
        $ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
        $ftpRequest.UsePassive = $true
        
        $response = $ftpRequest.GetResponse()
        $stream = $response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        
        $directories = @()
        while (-not $reader.EndOfStream) {
            $directories += $reader.ReadLine()
        }
        
        $reader.Close()
        $response.Close()
        
        return $directories
    }
    catch {
        Write-Host "Error al listar directorio $path : $_" -ForegroundColor Red
        return @()
    }
}

# Función para subir un archivo
function Upload-File {
    param (
        [string]$localFile,
        [string]$remoteFile
    )
    
    try {
        Write-Host "📤 Subiendo $localFile..." -ForegroundColor Cyan
        $uri = New-Object System.Uri("$ftpUrl$remotePath$remoteFile")
        $ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
        $ftpRequest.UseBinary = $true
        $ftpRequest.UsePassive = $true
        $ftpRequest.KeepAlive = $false

        $content = [System.IO.File]::ReadAllBytes($localFile)
        $ftpStream = $ftpRequest.GetRequestStream()
        $ftpStream.Write($content, 0, $content.Length)
        $ftpStream.Close()
        $ftpStream.Dispose()

        Write-Host "✅ $localFile subido correctamente" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Error al subir $localFile : $_" -ForegroundColor Red
        return $false
    }
}

# Función para crear directorio
function Create-Directory {
    param (
        [string]$path
    )
    
    try {
        $uri = New-Object System.Uri("$ftpUrl$remotePath$path")
        $ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
        $ftpRequest.UsePassive = $true
        $response = $ftpRequest.GetResponse()
        $response.Close()
        Write-Host "✅ Directorio $path creado correctamente" -ForegroundColor Green
        return $true
    }
    catch {
        if ($_.Exception.Message -match "550") {
            Write-Host "ℹ️ El directorio $path ya existe" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Error al crear directorio $path : $_" -ForegroundColor Red
        }
        return $false
    }
}

# Listar directorios disponibles
Write-Host "📂 Listando directorios disponibles..." -ForegroundColor Cyan
$availableDirs = List-Directory "/"
Write-Host "Directorios encontrados:" -ForegroundColor Yellow
$availableDirs | ForEach-Object { Write-Host "  - $_" }

# Subir archivos
Write-Host "`n🚀 Iniciando proceso de upload..." -ForegroundColor Cyan

# Crear directorio assets
Create-Directory "/assets"

# Subir index.html
Write-Host "`n📄 Subiendo archivos principales..." -ForegroundColor Yellow
Upload-File "$localPath\index.html" "/index.html"

# Subir vite.svg si existe
if (Test-Path "$localPath\vite.svg") {
    Upload-File "$localPath\vite.svg" "/vite.svg"
}

# Subir archivos de assets
Write-Host "`n📦 Subiendo archivos de assets..." -ForegroundColor Yellow
$assetsPath = Join-Path $localPath "assets"
if (Test-Path $assetsPath) {
    $assetsFiles = Get-ChildItem -Path $assetsPath -File
    foreach ($file in $assetsFiles) {
        # Intentar subir el archivo con 3 reintentos
        $maxRetries = 3
        $retryCount = 0
        $uploaded = $false
        
        while (-not $uploaded -and $retryCount -lt $maxRetries) {
            $uploaded = Upload-File $file.FullName "/assets/$($file.Name)"
            if (-not $uploaded) {
                $retryCount++
                if ($retryCount -lt $maxRetries) {
                    Write-Host "🔄 Reintento $retryCount de $maxRetries para $($file.Name)..." -ForegroundColor Yellow
                    Start-Sleep -Seconds 2
                }
            }
        }
    }
}

Write-Host "`n✨ Proceso de upload finalizado" -ForegroundColor Green

# Verificar estructura final
Write-Host "`n🔍 Verificando estructura final..." -ForegroundColor Cyan
$finalDirs = List-Directory "/"
Write-Host "Estructura actual del servidor:" -ForegroundColor Yellow
$finalDirs | ForEach-Object { Write-Host "  - $_" }

Write-Host "`n🌐 Visite http://boo-bets.net para ver el sitio" -ForegroundColor Cyan 