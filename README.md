# ALYX Properties — KYC Form · Estrutura de Ficheiros

Formulário KYC (Lei n.º 83/2017 · AML/CFT) separado em ficheiros modulares para facilitar a integração e manutenção.

---

## Estrutura de Pastas

```
alyx-kyc/
├── index.html              ← Ponto de entrada principal
├── css/
│   └── styles.css          ← Todo o CSS (variáveis, dark/light mode, componentes)
├── js/
│   └── app.js              ← Todo o JavaScript (lógica, traduções, PDF, validação)
└── sections/               ← Fragmentos HTML por secção do formulário
    ├── 01-modal-pdf.html
    ├── 02-header.html
    ├── 03-modo-banner.html
    ├── 04-toast.html
    ├── 05-progress.html
    ├── 06-cover-ref.html
    ├── 07-sec-A-imovel.html
    ├── 08-sec-G-mediacao.html
    ├── 09-sec-B-proposta.html
    ├── 10-sec-C-singular.html
    ├── 11-sec-C-coletiva.html
    ├── 12-sec-D-rep-legal.html
    ├── 13-sec-E-pep.html
    ├── 14-sec-F-documentos.html
    ├── 15-sec-H-assinaturas-legal.html
    └── 16-bottom-bar.html
```

---

## Secções do Formulário

| Ficheiro | Secção | Descrição |
|---|---|---|
| `01-modal-pdf.html` | Modal PDF | Pré-visualização e download do PDF gerado |
| `02-header.html` | Header | Logótipo ALYX, seletor de idioma (PT/EN), tema, tamanho de fonte |
| `03-modo-banner.html` | Banner de Modo | Toggle Modo Interno ↔ Modo Cliente |
| `04-toast.html` | Toast de Validação | Notificação de campos obrigatórios em falta |
| `05-progress.html` | Barra de Progresso | Progresso por secção (8 steps) |
| `06-cover-ref.html` | Capa + Ref. Interna | Seletor Singular/Coletiva + campos internos (só visíveis em Modo Interno) |
| `07-sec-A-imovel.html` | **A — Imóvel** | Morada, CP, localidade, proprietário, NIPC. ⚠️ Readonly para o cliente |
| `08-sec-G-mediacao.html` | **G — Mediação** | Dados da agência mediadora (opcional) |
| `09-sec-B-proposta.html` | **B — Proposta** | Valor, sinal CPCV, prazo escritura, fundos, pagamento, IBAN |
| `10-sec-C-singular.html` | **C — Singular** | Identificação, doc. identificação, fiscal, profissional, cônjuge |
| `11-sec-C-coletiva.html` | **C — Coletiva** | Empresa: identificação, sede, forma jurídica, responsável, RCBE, titulares |
| `12-sec-D-rep-legal.html` | **D — Rep. Legal** | Representante legal (condicional, se existir) |
| `13-sec-E-pep.html` | **E — PEP** | 4 questões sobre Pessoas Politicamente Expostas (Lei 83/2017) |
| `14-sec-F-documentos.html` | **F — Documentos** | Upload de documentos obrigatórios (singular/coletiva + origem de fundos) |
| `15-sec-H-assinaturas-legal.html` | **H — Assinaturas** | GDPR, declarações, assinaturas (PDF/CMD), notas legais |
| `16-bottom-bar.html` | Barra de Ações | Guardar progresso, submeter formulário (fixo no fundo) |

---

## CSS — `css/styles.css`

### Variáveis de Tema (`:root` / `body.light`)
```css
--black, --dark, --dark2       /* Fundos */
--border, --border2            /* Bordas */
--text, --text2, --text3       /* Texto (3 níveis) */
--gold, --gold2, --glow        /* Dourado ALYX */
--err, --err-bg                /* Erros */
--ok, --ok-bg                  /* Sucesso */
```

### Classes de Visibilidade por Modo
| Classe | Comportamento |
|---|---|
| `.internal-section` | Visível apenas em Modo Interno; oculto em `body.cliente-mode` |
| `.readonly-section` | Preenchido pela ALYX; readonly para o cliente |
| `.readonly-overlay` | Overlay invisível que bloqueia interação no Modo Cliente |

### Classes de Layout
- `.g2` / `.g3` — Grids de 2 ou 3 colunas
- `.s2` / `.s3` — Span de 2 ou 3 colunas
- `.f` — Campo de formulário (label + input + erro)
- `.opts` / `.opts-col` — Grupos de opções (radio/checkbox)
- `.opt.sq` — Checkbox; `.opt` sem `.sq` — Radio

---

## JavaScript — `js/app.js`

### Variáveis Globais
```js
var SECTIONS = 8;          // Número de secções no stepper
var currentLang = 'pt';    // 'pt' | 'en'
var currentType = 'singular'; // 'singular' | 'coletiva'
var currentModo = 'interno';  // 'interno' | 'cliente'
var pdfDoc = null;         // Objeto jsPDF gerado
var titularCount = 0;      // Contador de titulares (Coletiva)
var docFiles = {};         // Ficheiros de documentos carregados
```

### Funções Principais

#### Modo e UI
| Função | Descrição |
|---|---|
| `toggleModo()` | Alterna Modo Interno ↔ Modo Cliente |
| `applyModo()` | Aplica classes CSS e comportamentos readonly |
| `setType(type)` | Alterna entre 'singular' e 'coletiva' |
| `setLang(lang)` | Muda idioma e atualiza todos os `data-i18n` |
| `applyTheme(t)` | Aplica tema dark/light |
| `toggleFontSize()` | Alterna tamanho de fonte normal/grande |

#### Formulário
| Função | Descrição |
|---|---|
| `toggleChk(el)` | Toggle de checkbox multi-seleção |
| `toggleRad(el, grp)` | Toggle de radio (grupo exclusivo) |
| `ynToggle(btn, id, type)` | Toggle Sim/Não com collapse do detalhe |
| `addTitular()` | Adiciona bloco de titular (Coletiva) |
| `removeTitular(n)` | Remove bloco de titular |
| `checkFinPct()` | Mostra/oculta campos de banco conforme tipo de fundos |
| `fundRadToggle(chk, key)` | Toggle de origem de fundos + mostra upload |

#### Validação e Progresso
| Função | Descrição |
|---|---|
| `validateRequired()` | Valida campos `data-req` obrigatórios |
| `validateDocs()` | Valida documentos obrigatórios carregados |
| `showToast(errors)` | Mostra toast com lista de erros |
| `updateProgress()` | Recalcula e atualiza barra de progresso |

#### Guardar / Carregar
| Função | Descrição |
|---|---|
| `saveProgress()` | Serializa e guarda no `localStorage` |
| `loadProgress()` | Restaura dados guardados |
| `genRef()` | Gera referência interna automática (ALYX-YYYY-NNNN) |

#### PDF
| Função | Descrição |
|---|---|
| `collectFields()` | Recolhe todos os valores do formulário num objeto |
| `buildPreviewHTML(f)` | Gera HTML de pré-visualização do PDF |
| `buildPDF()` | Gera PDF com jsPDF (A4, cabeçalho, marca d'água) |
| `openDraftPDF()` | Abre modal com pré-visualização |
| `runExport(skip)` | Valida (ou não) e abre PDF |
| `downloadPDF()` | Faz download do ficheiro PDF |

#### CMD (Chave Móvel Digital)
| Função | Descrição |
|---|---|
| `openCmd(n)` | Inicia fluxo de autenticação CMD para proponente n |
| `confirmCmd(n)` | Confirma autenticação CMD |
| `cancelCmd(n)` | Cancela autenticação CMD |

---

## Internacionalização

As traduções estão no objeto `T` em `js/app.js`:
```js
var T = {
  pt: { ... },  // Português
  en: { ... }   // English
};
```

Os elementos HTML com atributo `data-i18n="chave"` são atualizados automaticamente ao chamar `setLang()`.

Campos obrigatórios têm `data-req-pt` e `data-req-en` para o label de erro no idioma correto.

---

## Dependências Externas

| Biblioteca | Versão | CDN |
|---|---|---|
| jsPDF | 2.5.1 | `cdnjs.cloudflare.com` |
| Google Fonts | — | Cormorant Garamond + Montserrat |

---

## Como Integrar

### Opção 1 — Ficheiro único (produção simples)
Usar o `index.html` original com tudo inline. Pronto a servir.

### Opção 2 — Separação de ficheiros (recomendada para CMS/frameworks)
1. Importar `css/styles.css` no `<head>`
2. Incluir cada fragmento de `sections/` no local correspondente (via SSI, template engine, ou componentes)
3. Carregar `js/app.js` antes do `</body>`, após jsPDF

### Opção 3 — Integração em framework (React/Vue/etc.)
- Converter os fragmentos HTML em componentes
- Mover o CSS para módulos ou tailwind custom properties
- Refatorar `app.js` em composables/hooks (o estado global já está isolado em variáveis no topo)

---

## Notas para o Backend

A função `submitForm()` em `js/app.js` está preparada para integração — está marcada com `// TODO: backend` e atualmente apenas exibe uma mensagem de estado. Para integrar:

```js
function submitForm() {
  var errors = validateRequired();
  var docErrors = validateDocs();
  if (errors.length > 0 || docErrors.length > 0) { ... }

  // TODO: Substituir por chamada à API
  // var payload = collectFields();
  // fetch('/api/kyc/submit', { method: 'POST', body: JSON.stringify(payload) })
}
```

Os ficheiros de documentos estão em `docFiles` (objeto `{chave: FileList}`).
