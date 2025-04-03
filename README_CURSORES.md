# Instruções para Adicionar Cursores Personalizados

Você precisará adicionar os arquivos de cursores personalizados ao servidor FTP para que funcionem corretamente no jogo.

## Arquivos de Cursores Necessários

1. `cursor-personalizado.png` - Cursor padrão que será usado em toda a página
2. `cursor-click.png` - Cursor que aparece ao passar o mouse sobre botões e cartas

## Como Criar Arquivos de Cursor

1. **Tamanho recomendado**: 32x32 pixels ou 64x64 pixels
2. **Formato**: PNG com transparência
3. **Ponto de clique**: Certifique-se de que o ponto de clique do cursor esteja na ponta do cursor

## Upload dos Cursores para o Servidor

### Usando FileZilla

1. Conecte ao servidor FTP:
   - Host: `ftp://82.25.72.132` ou `ftp://boo-bets.net`
   - Nome de usuário: `u366262974`
   - Senha: `454799Wonka@`
   - Porta: `21`

2. Envie os arquivos de cursor para a pasta raiz do servidor:
   - Arraste e solte os arquivos `cursor-personalizado.png` e `cursor-click.png` para o mesmo diretório onde está o `index.html`

## Exemplo de Cursores Personalizados

Se você não tem cursores personalizados, pode baixar exemplos gratuitos em:

1. [Cursor.cc](https://www.cursor.cc/) - Biblioteca de cursores gratuitos
2. [IconArchive](https://www.iconarchive.com/tag/cursor) - Cursores com designs variados
3. [FlatIcon](https://www.flaticon.com/search?word=cursor) - Ícones que podem ser usados como cursores

## Solução de Problemas

Se os cursores personalizados não aparecerem:

1. **Verifique os nomes dos arquivos**: Os nomes devem corresponder exatamente aos especificados no CSS
2. **Verifique os caminhos**: Os arquivos devem estar na pasta raiz do servidor
3. **Tamanho do arquivo**: Arquivos muito grandes podem não carregar corretamente
4. **Cache do navegador**: Tente limpar o cache do navegador com Ctrl+F5

## Observação Importante

Certifique-se de ter os direitos de uso para quaisquer imagens de cursor que você utilizar no seu site. 