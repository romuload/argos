# ArgosAI

Site institucional estático, publicado em https://romuload.github.io/argos/ pela branch `main`, raiz do repositório.

## Sistema visual (v3)

`assets/site.css` define uma família tipográfica (Inter variável, auto-hospedada em `assets/fonts/`, licença OFL), dois fundos (branco e `--off`), três ritmos de seção (`.chapter`, `.section`, `.cta-band`), um único card (`.pathway`, `.fact`, `.reason`) e três breakpoints (1100, 768 e 560). Área e estágio dos programas aparecem como etiquetas `.stage` no fim do card, não como linha acima do título. `assets/og-argosai.png` é a imagem de compartilhamento.

A home reordenou e agrupou o conteúdo de origem: a história do Marley vem logo após o hero, as duas faixas de links foram unidas e a seção de ciência mostra o recorte real do relatório demonstrativo. Por isso a comparação integral de texto de `tools/verify.cjs` acusa linhas da home e as linhas “área · estágio” como ausentes; o conteúdo continua presente, reescrito ou dividido.

## Conteúdo e navegação

18 páginas HTML independentes e três variações do contato: `?interesse=projeto`, `?interesse=codesenvolvimento` e `?interesse=equipe`. Todos os caminhos de navegação e recursos são relativos, incluindo páginas em dois níveis. Não há roteador, dependências de produção ou etapa de compilação. `.nojekyll` mantém a publicação estática.

`assets/site.css` compartilha a identidade editorial clara do índice aprovado; `assets/site.js` oferece menu móvel, revelação progressiva e geração local do briefing. As imagens moleculares são PNGs estáticos obtidos do desenho conceitual do índice anterior. Sticky no desktop; fluxo normal no celular e em movimento reduzido.

## Formulário

Nome, e-mail e contexto obrigatórios; organização opcional. Limites: 120, 254, 180 e 4.000 caracteres respectivamente. A seleção por query e o rótulo para equipe acompanham o original. O botão gera `argosai-resumo-{interesse}.txt` em UTF-8 com BOM. Não há envio, API, banco de dados, cookies ou armazenamento local. Sem JavaScript, o botão fica desativado para impedir envio acidental por GET. O canal de recebimento permanece em preparação, como na fonte.

## Fontes

Os cinco arquivos de inventário recebidos estão preservados em `source/`, inclusive o ZIP completo, JSON de extração e TXT integral. `source/pages.json` registra a estrutura pública consultada em 25/11/2026 para recuperar hierarquia, tabelas e FAQs. A verificação compara cada linha do texto do inventário com o texto de cada página, inclusive respostas inicialmente fechadas. Não houve resumo editorial do conteúdo.

O texto histórico de privacidade sobre recursos Porsche foi preservado e acompanhado de uma nota esclarecendo que esta reconstrução usa apenas recursos locais. Fotografias oficiais da equipe não foram fornecidas; seus espaços indicativos foram mantidos. A imagem de laboratório do site antigo foi substituída pela ilustração molecular da identidade aprovada.

## Downloads

Os oito arquivos em `downloads/` foram comparados byte a byte com a origem, com hashes registrados em `verification/download-checks.json`. Apresentação: PDF de seis páginas; relatório público: PDF de três páginas. Os SVGs foram analisados como XML e o ZIP passou na verificação CRC. Não há documentos simulados.

## Validação

Resultados em `verification/`: 18 páginas × quatro larguras (320, 390, 768 e 1440), integridade de links e âncoras, comparação integral de texto, três downloads reais do formulário, campos obrigatórios, e-mail inválido, espaços vazios, ausência de persistência e envio, menus, FAQs, abertura por `file:`, movimento reduzido e sticky medido no desktop. 28 destinos únicos retornaram HTTP 200 na prévia local.

Para repetir os testes no navegador, instale `playwright-core` como ferramenta de desenvolvimento e rode `node tools/verify.cjs`. Use `SITE_URL` para a URL da prévia terminando em `/argos/`, `CHROME_PATH` para o executável do Chrome e, se necessário, `PLAYWRIGHT_MODULE` para o módulo instalado. Sirva a pasta pai do repositório com `python3 -m http.server 8917`. Os resultados vão para `.verification/`. Nenhuma dessas ferramentas é carregada pelo site.

O medidor visual opcional exigia Node 22; o ambiente dispunha de Node 20. As capturas e os testes responsivos foram feitos diretamente no Chrome com Playwright. As escolhas visuais da identidade aprovada prevaleceram sobre regras estéticas genéricas.
