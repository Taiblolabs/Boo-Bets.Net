# Instrucciones de Despliegue

Este proyecto está configurado para desplegarse automáticamente en Hostinger a través de GitHub Actions.

## Despliegue Automático con GitHub Actions

El proyecto está configurado para desplegarse automáticamente cada vez que se hace un push a la rama `main`. El proceso es el siguiente:

1. Haz cambios en tu código local
2. Realiza commit de tus cambios: `git add . && git commit -m "Tu mensaje"`
3. Sube los cambios a GitHub: `git push origin main`
4. GitHub Actions ejecutará automáticamente el workflow de despliegue
5. En aproximadamente 1-2 minutos, tu sitio estará actualizado en https://boo-bets.net

### Requisitos para el despliegue automático

Para que el despliegue automático funcione, debes configurar el siguiente secreto en tu repositorio de GitHub:

1. Ve a tu repositorio en GitHub
2. Ve a Settings > Secrets and variables > Actions
3. Haz clic en "New repository secret"
4. Agrega el siguiente secreto:

#### FTP_PASSWORD

```
454799Wonka@
```

### Verificar estado del despliegue

Puedes verificar el estado del despliegue automático:

1. Ve a tu repositorio en GitHub
2. Haz clic en la pestaña "Actions"
3. Verás la lista de despliegues y su estado (en progreso, éxito o error)

### Despliegue manual desde GitHub

Si prefieres iniciar el despliegue manualmente desde GitHub:

1. Ve a tu repositorio en GitHub
2. Ve a Actions > Deploy to Hostinger
3. Haz clic en "Run workflow" en el botón desplegable
4. Selecciona la rama "main"
5. Haz clic en "Run workflow"

## Métodos alternativos de despliegue

Si por alguna razón el despliegue automático no funciona, puedes usar cualquiera de estos métodos manuales:

### 1. Usando el Script PowerShell

El método más fácil es usar el script PowerShell incluido en el proyecto:

```powershell
.\deploy-ftp-simple.ps1
```

Este script automáticamente:
- Se conecta al servidor FTP de Hostinger
- Crea los directorios necesarios
- Sube todos los archivos de la carpeta `dist/`

### 2. Despliegue FTP con FileZilla

1. Descarga e instala [FileZilla](https://filezilla-project.org/)
2. Configura la conexión:
   - Host: `82.25.72.132`
   - Usuario: `u366262974`
   - Contraseña: `454799Wonka@`
   - Puerto: `21`
3. Navega a `/public_html/boo-bets.net/`
4. Sube los archivos de la carpeta `dist/`

### 3. Despliegue SSH con SCP

```bash
scp -P 65002 -r ./dist/* u366262974@82.25.72.132:/home/u366262974/public_html/boo-bets.net/
```

### 4. Panel de Control de Hostinger

1. Accede a [https://hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Ve a la sección "Administrador de Archivos"
3. Navega a `/public_html/boo-bets.net/`
4. Sube los archivos de la carpeta `dist/`

## Verificación

Para verificar la conexión FTP antes de desplegar, puedes usar:

```powershell
.\check-ftp.ps1
```

## Acceso al Sitio

Una vez desplegado, el sitio estará disponible en:
- [https://boo-bets.net](https://boo-bets.net) 