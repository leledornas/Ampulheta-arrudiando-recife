# Arrudiando Recife – Ampulheta

Temporizador de ampulheta para o jogo Arrudiando Recife, feito para o celular. Cada rodada dura um tempo **aleatório entre 30 e 40 segundos**, que o jogador não vê. Quando a areia acaba, um alarme toca para avisar que é a vez de girar a roleta.

É uma tela única, feita só com HTML, CSS e JavaScript puros, sem dependências e sem etapa de build.

**🔗 Acesse online:** [leledornas.github.io/Ampulheta-arrudiando-recife](https://leledornas.github.io/Ampulheta-arrudiando-recife/)

## Como funciona

1. Toque em **Começar partida**. A ampulheta começa a correr e o relógio mostra o tempo decorrido.
2. Quando o tempo sorteado acaba, o alarme toca **4 vezes**, o celular vibra e aparece "Vez de girar a roleta!".
3. Depois dos 4 toques, a ampulheta **reinicia sozinha** com um novo tempo sorteado.
4. Isso se repete rodada após rodada até alguém tocar em **Finalizar partida**.
5. Ao finalizar, o som e a vibração param na hora e a tela mostra o total de rodadas jogadas. Toque em **Começar nova partida** para jogar de novo.

O botão de som, no canto superior direito, liga e desliga o alarme. O card no fim da tela mostra quantas **rodadas** já foram jogadas, e o contador volta a zero ao começar uma nova partida.

## Como usar

**Direto no computador:** dê dois cliques em `index.html`. Mantenha os quatro arquivos do projeto juntos na mesma pasta, senão a página abre sem estilo, sem lógica ou sem a ursa.

**Servindo localmente (para testar no celular na mesma rede Wi-Fi):**

```bash
python3 -m http.server 8000
```

Abra `http://<ip-do-computador>:8000/` no celular.

## Publicar na internet

Como são só arquivos estáticos, qualquer hospedagem gratuita serve (Netlify Drop, GitHub Pages, Vercel, Cloudflare Pages). Este projeto está publicado com o GitHub Pages (branch `main`, pasta raiz). Como o arquivo principal se chama `index.html`, o link abre direto na tela do jogo. Para atualizar o site, envie os arquivos novos para o repositório (*Add file → Upload files* no GitHub) e espere cerca de 1 a 2 minutos até o GitHub Pages republicar. Se o celular mostrar a versão antiga, feche e abra a aba de novo.

Depois de publicado, dá para instalar como atalho na tela inicial:

- **Android (Chrome):** menu ⋮ → *Adicionar à tela inicial*.
- **iPhone (Safari):** botão Compartilhar → *Adicionar à Tela de Início*.

## Personalização

As configurações ficam no começo do arquivo `script.js`:

| Constante | Padrão | O que faz |
|---|---|---|
| `MIN_SECONDS` | `25` | Menor duração possível de uma rodada (segundos) |
| `MAX_SECONDS` | `40` | Maior duração possível de uma rodada (segundos) |
| `ALARM_REPEATS` | `4` | Quantas vezes o alarme toca antes da próxima rodada |
| `ALARM_GAP` | `0.7` | Intervalo entre um toque e outro (segundos) |

A pausa até a próxima rodada começar se ajusta sozinha a `ALARM_REPEATS` e `ALARM_GAP`.

As cores estão como variáveis CSS no `:root` do `style.css` (`--navy`, `--coral`, `--sun`, `--teal`, `--cream`).

## Detalhes técnicos

- **Som:** gerado pelo navegador com a Web Audio API, sem arquivo de áudio. Navegadores só liberam som depois de um toque do usuário, e o toque em "Começar partida" já faz isso.
- **Tela ligada:** durante a partida o site pede ao navegador para não apagar a tela (Wake Lock API), quando o aparelho suporta.
- **Vibração:** usa a Vibration API, quando disponível.
- **Fontes:** Archivo Black e DM Sans vêm do Google Fonts, então precisam de internet na primeira abertura. Sem elas, o site usa fontes do sistema e continua funcionando.
- **Layout:** mobile-first, ocupa a tela inteira do celular. No computador aparece dentro de uma moldura de celular.

## Limitações conhecidas

- No iPhone, o site pede ao Safari para tocar o alarme mesmo no modo silencioso, mas isso depende da versão do iOS (o volume de mídia precisa estar alto). O Safari também não suporta vibração.
- Se o navegador for para segundo plano, o alarme ainda dispara no fim da rodada, mas o sistema pode atrasar o som em alguns segundos.
- Os recursos de tela sempre ligada e vibração dependem do aparelho e do navegador.

## Estrutura

```
index.html   # estrutura da página
style.css    # estilos (cores, layout, animações)
script.js    # lógica do temporizador, alarme e som
ursa.png     # imagem da ursa no cabeçalho
README.md
```
