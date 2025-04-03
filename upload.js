/**
 * Script para subir archivos al servidor FTP
 * 
 * Para usar:
 * 1. Instalar dependencia: npm install basic-ftp
 * 2. Ejecutar: node upload.js
 */

const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

// Configuración FTP
const config = {
  host: '82.25.72.132', // o 'boo-bets.net'
  user: 'u366262974',
  password: '454799Wonka@',
  secure: false
};

// Ruta de origen (carpeta dist) y destino en el servidor
const localDir = path.join(__dirname, 'dist');
const remoteDir = '/public_html';

async function uploadToFTP() {
  const client = new ftp.Client();
  client.ftp.verbose = true; // Para depuración
  
  try {
    console.log('Conectando al servidor FTP...');
    await client.access(config);
    
    console.log('Navegando a la carpeta destino...');
    try {
      await client.ensureDir(remoteDir);
    } catch (err) {
      console.log('Creando directorio destino...');
      await client.mkdir(remoteDir, true);
      await client.cd(remoteDir);
    }
    
    console.log(`Subiendo archivos desde ${localDir} a ${remoteDir}...`);
    await client.uploadFromDir(localDir);
    
    console.log('¡Subida completada con éxito!');
  } catch (err) {
    console.error('Error durante la subida FTP:', err);
  } finally {
    client.close();
  }
}

uploadToFTP(); 