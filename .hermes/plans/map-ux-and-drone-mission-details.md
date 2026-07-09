# Plano: Melhorias de UX no Drone Mission e Mapa

## Tarefa 1: Visualizar voos agendados com detalhes da rota

**Problema:** A lista de missões salvas mostra apenas dados resumidos (nome, data, área, fotos). O usuário não consegue ver a rota calculada nem os detalhes completos.

**Solução:**
1. Adicionar `getMissionById(id)` no `drone-mission-persistence.service.ts` — busca missão completa no backend
2. Adicionar `DroneMissionDetailsPanel` — componente que expande os detalhes de uma missão salva (waypoints, stats, parâmetros, câmera)
3. Na `DroneMissionPage`, permitir clicar numa missão salva para:
   - Carregar waypoints no mapa (reutilizar a lógica existente de `mission.waypoints`)
   - Mostrar painel de resultados com stats completos
   - Botão "Carregar Missão" que popula o mapa

**Arquivos:**
- `src/features/drone-mission/drone-mission-persistence.service.ts`
- `src/features/drone-mission/DroneMissionPage.tsx`

## Tarefa 2: Reposicionar botão "Desenhar polígono"

**Problema:** O botão "✏️ Desenhar polígono" está posicionado em `top-3 left-3` (canto superior esquerdo), exatamente onde fica o controle de zoom do Leaflet. O botão fica sobreposto aos botões de zoom, dificultando o uso.

**Solução:**
1. Mover os botões de controle para `top-3 right-3` (canto superior direito)
2. Ou mover para `top-16 left-3` (abaixo do zoom)
3. Melhorar o contraste: botão com `bg-card text-foreground border` em vez de `bg-white` (que pode sumir em temas claros)

**Arquivo:**
- `src/features/drone-mission/DroneMissionMap.tsx`

## Tarefa 3: Fallback de geocoding para projetos em 0,0

**Problema:** Quando o projeto tem `latitude: 0, longitude: 0` (não informado), o mapa centraliza no meio do oceano (Golfo da Guiné).

**Solução:**
1. Adicionar verificação `(lat !== 0 || lon !== 0)` — se for 0,0, não usar essas coordenadas
2. Criar função `geoCodeProjectAddress(location: LocationDto)` que:
   - Tenta geocoding via Nominatim (OSM) com: `address, city, state, country`
   - Se não achar: `city, state, country`
   - Se não achar: `state, country`
   - Se não achar: `country`
3. Na `DroneMissionPage`, quando lat/lon são inválidos, chamar geocoding
4. Usar `AbortController` + timeout de 3s para não travar a UI

**Arquivos:**
- `src/features/drone-mission/DroneMissionPage.tsx`

## Quality Gates
- Lint: 0 erros
- Testes existentes: continuar passando
- Build: production build

## Riscos
- Nominatim tem rate limit (1 req/s). Como é só no carregamento da página, deve ser OK
- A API de drone-mission GET/:id precisa existir no backend. Se não existir, precisamos criar ou fazer o backend aceitar

