# Script para construir, verificar e subir o projeto BooBets via FTP para Hostinger

# Configurar codificação UTF-8 para evitar problemas com caracteres especiais
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Mostrar mensagem de início
Write-Host "🚀 Iniciando processo de construção e upload do BooBets..." -ForegroundColor Cyan

# Verificar se o diretório do projeto existe
$projectPath = "C:\Users\steve\Documents\third\test"
$distPath = "$projectPath\dist"

if (-Not (Test-Path $projectPath)) {
    Write-Error "❌ O diretório do projeto não foi encontrado: $projectPath"
    exit 1
}

# Salvar localização atual
$originalLocation = Get-Location

# Mudar para o diretório do projeto e construir
Write-Host "📁 Mudando para o diretório do projeto..." -ForegroundColor Yellow
Set-Location $projectPath

# Instalar dependências e construir
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm install

Write-Host "🛠️ Construindo o projeto..." -ForegroundColor Yellow
npm run build

# Verificar se build foi bem sucedida
if (-Not (Test-Path $distPath)) {
    Write-Error "❌ O diretório 'dist' não foi criado. Verifique se a build foi concluída corretamente."
    Set-Location $originalLocation
    exit 1
}

# Voltar para o diretório original
Set-Location $originalLocation

# Definindo credenciais de FTP
$ftpUser = 'u366262974'
$ftpHost = '82.25.72.132'
$ftpPass = '454799Wonka@'
$remotePath = "/public_html/boo-bets.net"

# Fazer upload via FTP
Write-Host "📤 Conectando via FTP e enviando arquivos..." -ForegroundColor Green

$ftp = "ftp://$ftpHost$remotePath/"
$files = Get-ChildItem -Path $distPath -Recurse

foreach ($file in $files) {
    if (-not $file.PSIsContainer) {
        $target = $ftp + ($file.FullName.Substring($distPath.Length + 1) -replace '\\', '/')
        $uri = New-Object System.Uri($target)
        $ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $ftpRequest.UseBinary = $true

        $content = [System.IO.File]::ReadAllBytes($file.FullName)
        $ftpStream = $ftpRequest.GetRequestStream()
        $ftpStream.Write($content, 0, $content.Length)
        $ftpStream.Close()
        Write-Host "✅ Upload: $($file.Name)" -ForegroundColor Gray
    }
}

# Verificação do site na web
Write-Host "🔍 Verificando se o site está acessível..." -ForegroundColor Cyan

$webClient = New-Object System.Net.WebClient
$htmlContent = $webClient.DownloadString("http://boo-bets.net")
$webClient.Dispose()

if ($htmlContent -match "assets/") {
    Write-Host "✅ Site BooBets carregado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Site acessado, mas assets não encontrados. Verifique caminhos no index.html." -ForegroundColor Yellow
}

# Finalização
Write-Host "🎉 Upload concluído. Confira o site: https://boo-bets.net" -ForegroundColor Cyan 