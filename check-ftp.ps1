# Script para verificar la conexión FTP con Hostinger

$ftpHost = "82.25.72.132"
$ftpUser = "u366262974"
$ftpPass = "454799Wonka@"

Write-Host "Verificando conexión FTP con Hostinger..." -ForegroundColor Yellow

try {
    # Crear una solicitud FTP para listar directorios
    $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost/")
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $ftpRequest.Timeout = 15000 # 15 segundos
    
    # Obtener respuesta
    $ftpResponse = $ftpRequest.GetResponse()
    $streamReader = New-Object System.IO.StreamReader($ftpResponse.GetResponseStream())
    
    Write-Host "Conexión establecida con éxito!" -ForegroundColor Green
    Write-Host "Listando contenido del directorio raíz:" -ForegroundColor Yellow
    
    # Mostrar el contenido del directorio
    $lineCount = 0
    while (-not $streamReader.EndOfStream -and $lineCount -lt 20) {
        $line = $streamReader.ReadLine()
        Write-Host " - $line"
        $lineCount++
    }
    
    if (-not $streamReader.EndOfStream) {
        Write-Host "... (Mostrando primeros 20 elementos)"
    }
    
    # Cerrar conexiones
    $streamReader.Close()
    $ftpResponse.Close()
}
catch {
    Write-Host "Error de conexión: $($_.Exception.Message)" -ForegroundColor Red
    
    # Mostrar información adicional
    Write-Host "`nInformación de red:" -ForegroundColor Yellow
    try {
        $pingResult = Test-Connection -ComputerName $ftpHost -Count 2 -ErrorAction Stop
        Write-Host "Ping a $ftpHost exitoso: $pingResult" -ForegroundColor Green
    }
    catch {
        Write-Host "No se pudo hacer ping a $ftpHost" -ForegroundColor Red
    }
    
    Write-Host "`nIntentando conexión alternativa a ftp://boo-bets.net..." -ForegroundColor Yellow
    try {
        $altFtpRequest = [System.Net.FtpWebRequest]::Create("ftp://boo-bets.net/")
        $altFtpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
        $altFtpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $altFtpRequest.Timeout = 15000 # 15 segundos
        
        $altFtpResponse = $altFtpRequest.GetResponse()
        Write-Host "Conexión alternativa exitosa!" -ForegroundColor Green
        $altFtpResponse.Close()
    }
    catch {
        Write-Host "También falló la conexión alternativa: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nVerificación completada." -ForegroundColor Yellow 