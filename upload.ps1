# Script para upload de arquivos via FTP com criação de diretórios e log robusto

# Configurações
$projectDist = "C:\Users\steve\Documents\third\test\dist"
$ftpHost = "ftp://boo-bets.net"
$ftpUser = "u366262974"
$ftpPass = "454799Wonka@"
$ftpTargetPath = ""  # Usar diretório raiz
$logFile = "C:\Users\steve\Documents\third\upload-log.txt"

# Início do log
"[UPLOAD LOG] $(Get-Date)" | Out-File -FilePath $logFile -Encoding utf8 -Append

# Verifica se diretório dist existe
if (-Not (Test-Path $projectDist)) {
    Write-Error "❌ O diretório 'dist' não existe. Execute 'npm run build' primeiro."
    "❌ Diretório dist inexistente" | Out-File -FilePath $logFile -Append
    exit 1
}

# Função para verificar se o caminho remoto existe (tentando criar diretórios intermediários)
function Initialize-FtpFolderStructure {
    param ([string]$fullPath)
    $parts = $fullPath -split '/'
    $path = "$ftpHost"
    foreach ($p in $parts) {
        if ($p -ne "" -and $p -ne "ftp:" -and $p -ne "boo-bets.net") {
            $path += "/$p"
            try {
                $request = [System.Net.FtpWebRequest]::Create($path)
                $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
                $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
                $request.UsePassive = $true
                $request.KeepAlive = $false
                $request.GetResponse().Close()
            } catch {
                if (-not $_.Exception.Message.Contains("550")) {
                    Write-Host "⚠️ Erro ao criar pasta: $path" -ForegroundColor Yellow
                }
            }
        }
    }
}

# Função para enviar os arquivos via FTP
function Publish-FtpFolder {
    param ([string]$localFolder, [string]$remoteFolder)

    $files = Get-ChildItem -Path $localFolder -Recurse
    foreach ($file in $files) {
        if (-not $file.PSIsContainer) {
            $relativePath = $file.FullName.Substring($localFolder.Length + 1).TrimStart('\') -replace '\\', '/'
            $remotePath = "$ftpTargetPath/$relativePath"
            $uri = "$ftpHost$remotePath"

            # Garante a estrutura remota
            $folderPath = $remotePath -replace '/[^/]*$', ''
            Initialize-FtpFolderStructure -fullPath $folderPath

            try {
                $ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
                $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
                $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
                $ftpRequest.UseBinary = $true
                $ftpRequest.UsePassive = $true
                $ftpRequest.KeepAlive = $false

                $fileContent = [System.IO.File]::ReadAllBytes($file.FullName)
                $ftpStream = $ftpRequest.GetRequestStream()
                $ftpStream.Write($fileContent, 0, $fileContent.Length)
                $ftpStream.Close()

                Write-Host "✅ Enviado: $relativePath" -ForegroundColor Green
                "✅ Enviado: $relativePath" | Out-File -FilePath $logFile -Append
            } catch {
                Write-Host "❌ Falha ao enviar: $relativePath" -ForegroundColor Red
                $_.Exception.Message | Out-File -FilePath $logFile -Append
            }
        }
    }
}

# Início do upload
Write-Host "📤 Iniciando upload..." -ForegroundColor Cyan
"📤 Iniciando upload..." | Out-File -FilePath $logFile -Append
Publish-FtpFolder -localFolder $projectDist -remoteFolder $ftpTargetPath
Write-Host "🎉 Upload concluído. Verifique: https://boo-bets.net" -ForegroundColor Cyan
"🎉 Upload concluído" | Out-File -FilePath $logFile -Append 