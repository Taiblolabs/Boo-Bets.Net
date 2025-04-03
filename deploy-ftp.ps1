# Script para desplegar archivos a Hostinger vía FTP

$ftpHost = "82.25.72.132"
$ftpUser = "u366262974"
$ftpPass = "454799Wonka@"
$ftpPath = "/public_html/boo-bets.net/"

# Crear un objeto WebClient para FTP
$webClient = New-Object System.Net.WebClient
$webClient.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)

# Función para subir un solo archivo
function Upload-File {
    param (
        [string]$localPath,
        [string]$remotePath
    )
    
    try {
        Write-Host "Subiendo $localPath a $remotePath..." -ForegroundColor Yellow
        $webClient.UploadFile("ftp://$ftpHost$remotePath", $localPath)
        Write-Host "¡Archivo subido exitosamente!" -ForegroundColor Green
    }
    catch {
        Write-Host "Error al subir $localPath : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Función para crear directorio (no siempre funciona en todos los servidores FTP)
function Create-Directory {
    param (
        [string]$path
    )
    
    try {
        $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost$path")
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $ftpRequest.GetResponse() | Out-Null
        Write-Host "Directorio $path creado correctamente" -ForegroundColor Green
    }
    catch {
        Write-Host "El directorio $path ya existe o no se pudo crear: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Limpiar el directorio remoto (opcional)
$cleanRemote = Read-Host "¿Desea limpiar el directorio remoto antes de subir los archivos? (S/N)"
if ($cleanRemote -eq "S" -or $cleanRemote -eq "s") {
    try {
        Write-Host "Limpiando directorio remoto..." -ForegroundColor Yellow
        
        # Obtener lista de archivos en el directorio remoto
        $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost$ftpPath")
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        
        $ftpResponse = $ftpRequest.GetResponse()
        $streamReader = New-Object System.IO.StreamReader($ftpResponse.GetResponseStream())
        
        $directories = @()
        while (-not $streamReader.EndOfStream) {
            $line = $streamReader.ReadLine()
            if ($line -ne "." -and $line -ne "..") {
                $directories += $line
            }
        }
        
        $streamReader.Close()
        $ftpResponse.Close()
        
        # Eliminar cada archivo o directorio
        foreach ($item in $directories) {
            try {
                $deleteRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost$ftpPath$item")
                $deleteRequest.Method = [System.Net.WebRequestMethods+Ftp]::DeleteFile
                $deleteRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
                $deleteRequest.GetResponse() | Out-Null
                Write-Host "Eliminado $item" -ForegroundColor Green
            }
            catch {
                Write-Host "No se pudo eliminar $item: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    catch {
        Write-Host "Error al limpiar directorio remoto: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Crear directorio assets si no existe
Create-Directory "$ftpPath/assets"

# Subir el archivo index.html
Upload-File "./dist/index.html" "$ftpPath/index.html"

# Subir el archivo vite.svg
Upload-File "./dist/vite.svg" "$ftpPath/vite.svg"

# Subir los archivos de assets
$assets = Get-ChildItem -Path "./dist/assets" -File
foreach ($asset in $assets) {
    Upload-File $asset.FullName "$ftpPath/assets/$($asset.Name)"
}

Write-Host "¡Despliegue completado!" -ForegroundColor Green 