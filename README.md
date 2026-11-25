# ArgosAI

Site institucional estático, publicado em https://romuload.github.io/argos/ pela branch `main`, raiz do repositório.

## Sistema visual (v3)

`assets/site.css` define uma família tipográfica (Inter variável, auto-hospedada em `assets/fonts/`, licença OFL), dois fundos (branco e `--off`), três ritmos de seção (`.chapter`, `.section`, `.cta-band`), um único card (`.pathway`, `.fact`, `.reason`) e três breakpoints (1100, 768 e 560). Área e estágio dos programas aparecem como etiquetas `.stage` no fim do card, não como linha acima do título. `assets/og-argosai.png` é a imagem de compartilhamento.

A home reordenou e agrupou o conteúdo de origem (e, na v4, separou “área · estágio” e a numeração das etapas em campos próprios): a história do Marley vem logo após o hero, as duas faixas de links foram unidas e a seção de ciência mostra o recorte real do relatório demonstrativo. Por isso a comparação integral de texto de `tools/verify.cjs` acusa linhas da home e as linhas “área · estágio” como ausentes; o conteúdo continua presente, reescrito ou dividido.

## Experiências da home (v4)

- **Hero com vídeo controlado pelo scroll.** `assets/videos/hero-scroll.mp4` (H.264, 1440×628, 24 fps, todos os quadros são keyframes, sem áudio, fast start, 4,5 MB). O contêiner tem 210vh e o palco é sticky; `site.js` converte o progresso do scroll em `currentTime` com `requestAnimationFrame`, só depois de `loadedmetadata`, e espera `seeked` antes da próxima busca. Não há autoplay, loop, controles nem bloqueio do scroll. O vídeo só é carregado a partir de 768px, sem `prefers-reduced-motion` e sem economia de dados; nos demais casos a hero usa `assets/images/hero/hero-poster*.webp` (imagem original do laboratório, com recorte retrato no celular). O poster do `<video>` é o primeiro quadro do próprio vídeo (`hero-video-first-frame.webp`), porque o enquadramento do vídeo é diferente do da imagem estática.
- **Header de dois estados.** Na home o header é fixo e transparente sobre a hero (`.is-over-hero`), e fica sólido depois dela. Sem JavaScript ele permanece sólido.
- **Benefícios em sticky cards.** CSS `position: sticky` com offsets progressivos a partir de 900px de largura e 640px de altura; abaixo disso, sequência vertical. Onde o navegador suporta `animation-timeline`, os cards anteriores recuam levemente.
- **Produtos.** Grid editorial com imagem 4:3, área, estágio e CTA; as mesmas imagens aparecem em `produtos/` e nas páginas individuais.
- **Plataforma em scrollytelling.** Componente `.scrolly` (home e `plataforma/`): painel sticky à esquerda, etapas à direita, troca por `IntersectionObserver`. Abaixo de 900px cada etapa mostra a própria imagem. Sem JavaScript todo o texto continua legível.

## Imagens e pendências de assets

Imagens em `assets/images/{hero,benefits,products,platform}/`, em WebP e com nomes semânticos. Todas são ilustrativas e estão sinalizadas como tal no site.

- `products/product-diagnostics.webp`: recortada da imagem enviada para remover um cassete com os rótulos “PARVO” e “CORONA” e linhas de resultado, que representariam doenças erradas e um teste com resultado. O original tem só 768px, então o recorte ficou com 520×390; vale produzir uma imagem própria em alta resolução, sem marcas nem resultados.
- `platform/platform-analysis.webp` e `platform/platform-prioritization.webp` têm aparência de figuras de publicação (a segunda tem rótulos em inglês); confirmar licença de uso. O mesmo vale para `products/product-chagas.webp`, que parece uma micrografia eletrônica real.
- `products/product-peptides.webp` usa tons saturados de roxo e rosa, mais próximos do neon que o brief pede para evitar.
- O vídeo da hero foi entregue em 992×432; foi ampliado para 1440px, o que deixa a imagem suave em telas grandes. Uma versão com pelo menos 1920px de largura melhora o resultado sem mudar o código.
- Não há fotografias reais de Marley no repositório; a seção segue só com texto.

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

Para repetir os testes no navegador, instale `playwright-core` como ferramenta de desenvolvimento e rode `node tools/verify.cjs`. Use `SITE_URL` para a URL da prévia terminando em `/argos/`, `CHROME_PATH` para o executável do Chrome e, se necessário, `PLAYWRIGHT_MODULE` para o módulo instalado. Sirva a pasta pai do repositório com `python3 -m http.server 8917`. Esse servidor não aceita requisições `Range`, então o vídeo da hero não avança com o scroll nele; para testar o scrub localmente use um servidor estático com suporte a `Range` (o GitHub Pages tem). Os resultados vão para `.verification/`. Nenhuma dessas ferramentas é carregada pelo site.

O medidor visual opcional exigia Node 22; o ambiente dispunha de Node 20. As capturas e os testes responsivos foram feitos diretamente no Chrome com Playwright. As escolhas visuais da identidade aprovada prevaleceram sobre regras estéticas genéricas.
