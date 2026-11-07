# Arrudiando Recife – Ampulheta

Temporizador de ampulheta para o jogo Arrudiando Recife, feito para o celular. Cada rodada dura um tempo **aleatório entre 25 e 40 segundos**, que o jogador não vê. Quando a areia acaba, um alarme toca para avisar que é a vez de girar a roleta.

É uma tela única, em um único arquivo HTML, sem dependências e sem etapa de build.

## Como funciona

1. Toque em **Começar partida**. A ampulheta começa a correr e o relógio mostra o tempo decorrido.
2. Quando o tempo sorteado acaba, o alarme toca **4 vezes**, o celular vibra e aparece "Vez de girar a roleta!".
3. Depois dos 4 toques, a ampulheta **reinicia sozinha** com um novo tempo sorteado.
4. Isso se repete rodada após rodada até alguém tocar em **Finalizar partida**.
5. Ao finalizar, o som e a vibração param na hora e a tela mostra o total de rodadas jogadas. Toque em **Começar nova partida** para jogar de novo.

O botão de som, no canto superior direito, liga e desliga o alarme.

## Como usar

**Direto no computador:** dê dois cliques em `temporizador-ampulheta-recifense.html`.

**Servindo localmente (para testar no celular na mesma rede Wi-Fi):**

```bash
python3 -m http.server 8000
```

Abra `http://<ip-do-computador>:8000/temporizador-ampulheta-recifense.html` no celular.

## Personalização

As configurações ficam no começo do bloco `<script>`:

| Constante | Padrão | O que faz |
|---|---|---|
| `MIN_SECONDS` | `25` | Menor duração possível de uma rodada (segundos) |
| `MAX_SECONDS` | `40` | Maior duração possível de uma rodada (segundos) |
| `ALARM_REPEATS` | `4` | Quantas vezes o alarme toca antes da próxima rodada |
| `ALARM_GAP` | `0.7` | Intervalo entre um toque e outro (segundos) |

A pausa até a próxima rodada começar se ajusta sozinha a `ALARM_REPEATS` e `ALARM_GAP`. O texto "25–40 segundos" do card na tela também acompanha `MIN_SECONDS` e `MAX_SECONDS`.

As cores estão como variáveis CSS no `:root` (`--navy`, `--coral`, `--sun`, `--teal`, `--cream`).

## Detalhes técnicos

- **Som:** gerado pelo navegador com a Web Audio API, sem arquivo de áudio. Navegadores só liberam som depois de um toque do usuário, e o toque em "Começar partida" já faz isso.
- **Tela ligada:** durante a partida o site pede ao navegador para não apagar a tela (Wake Lock API), quando o aparelho suporta.
- **Vibração:** usa a Vibration API, quando disponível.
- **Fontes:** Anton, Archivo Black e DM Sans vêm do Google Fonts, então precisam de internet na primeira abertura. Sem elas, o site usa fontes do sistema e continua funcionando.
- **Layout:** mobile-first, ocupa a tela inteira do celular. No computador aparece dentro de uma moldura de celular.

## Limitações conhecidas

- No iPhone, o modo silencioso pode abafar o alarme, e o Safari não suporta vibração.
- Se o navegador for para segundo plano, o alarme ainda dispara no fim da rodada, mas o sistema pode atrasar o som em alguns segundos.
- Os recursos de tela sempre ligada e vibração dependem do aparelho e do navegador.

## Estrutura

```
temporizador-ampulheta-recifense.html   # site completo (HTML + CSS + JS)
README.md
```
