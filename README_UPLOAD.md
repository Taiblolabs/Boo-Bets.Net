# Instruções para Upload no Servidor FTP

## Problema 404 Resolvido

Corrigimos o problema 404 simplificando a estrutura do site. Em vez de usar React e dependências complexas, criamos uma versão HTML simples do jogo que funciona diretamente no servidor.

## Arquivos a serem enviados

1. Upload o arquivo `dist/index.html` para o diretório raiz do servidor (`/`)
2. Upload dos arquivos de cursor:
   - `dist/cursor.svg` → `/cursor.svg` no servidor
   - `dist/cursor-click.svg` → `/cursor-click.svg` no servidor

## Instruções passo a passo para upload via FTP

### Usando FileZilla (Recomendado)

1. **Baixe e instale o FileZilla** em https://filezilla-project.org/download.php

2. **Abra o FileZilla e conecte ao servidor:**
   - Host: `ftp://82.25.72.132` ou `ftp://boo-bets.net`
   - Nome de usuário: `u366262974`
   - Senha: `454799Wonka@`
   - Porta: `21`

3. **Upload dos arquivos:**
   - No painel esquerdo, navegue até `C:\Users\steve\Documents\third\test\dist`
   - Selecione os arquivos `index.html`, `cursor.svg` e `cursor-click.svg`
   - Arraste-os para o diretório raiz no painel direito

### Usando Windows Explorer

1. Abra o Windows Explorer
2. Na barra de endereços, digite: `ftp://u366262974:454799Wonka@@82.25.72.132`
3. Copie e cole os arquivos da pasta `dist` para o servidor

### Verificação

Após o upload, acesse http://boo-bets.net/ no navegador para verificar se o site está funcionando corretamente. Você deverá ver o cursor personalizado ao mover o mouse pela página.

## Personalizando os Cursores

Os arquivos SVG de cursor fornecidos são apenas exemplos. Se preferir usar suas próprias imagens de cursor:

1. Substitua os arquivos `cursor.svg` e `cursor-click.svg` pelos seus próprios arquivos
2. Você também pode usar imagens PNG, mas lembre-se de atualizar o arquivo `index.html` para refletir o formato correto

## Solução de problemas

Se ainda estiver recebendo erro 404:

1. **Verifique os nomes de arquivo**: Certifique-se de que os arquivos foram enviados com os nomes exatos
2. **Permissões**: Verifique se os arquivos têm permissões de leitura para todos (644)
3. **Configuração do servidor**: Verifique se o servidor está configurado para usar `index.html` como arquivo padrão

Se os cursores personalizados não aparecerem:
1. Certifique-se de que os arquivos de cursor foram enviados para o servidor
2. Verifique se os nomes dos arquivos no CSS correspondem aos nomes dos arquivos enviados
3. Tente limpar o cache do navegador (Ctrl+F5)

## Para desenvolvimento futuro

Para continuar desenvolvendo o jogo React completo:
1. Continue editando os arquivos na pasta `src/`
2. Execute `npm run dev` para testar localmente
3. Quando estiver pronto, use `npm run build` para criar uma nova versão
4. Configure o servidor web corretamente para suportar aplicações React 