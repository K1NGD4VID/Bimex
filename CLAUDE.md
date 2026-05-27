# Bimex — Contexto para Claude

Plataforma de crowdfunding de impacto social donde el capital de los contribuidores siempre es recuperable, construida sobre Stellar y Soroban. Los rendimientos (CETES ~9.45% + AMM Stellar ~4%) financian el proyecto; al completarse, cada contribuidor recibe exactamente su inversión original de vuelta.

**Deploy:** https://bimex-frontend.vercel.app  
**Repo:** https://github.com/David1984TK/Bimex  
**Branch de trabajo:** `claude/bimex-review-wlvPQ`

## Stack

| Capa | Tecnología |
|---|---|
| Smart contract | Rust + Soroban (Stellar) |
| Frontend | React + Vite (`bimex-frontend/`) |
| Indexer | Node.js (`bimex-indexer/`) |
| Stablecoin | MXNe (Peso mexicano en Stellar vía Etherfuse) |
| Wallet | Freighter |
| Storage docs | IPFS vía Pinata (`VITE_PINATA_API_KEY`, `VITE_PINATA_SECRET`) |
| Notificaciones | Supabase + Resend |
| Despliegue | Vercel (root: `bimex-frontend/`) |
| i18n | react-i18next (ES / EN) |

## Estructura

```
bimex/                  → Smart contract Rust/Soroban
bimex-frontend/         → React app (Vite)
bimex-indexer/          → Indexer de eventos on-chain
docs/                   → Guías y documentación
scripts/                → Scripts de deploy y prueba
```

## Variables de entorno (bimex-frontend/.env.example)

```
VITE_CONTRACT_ID=
VITE_TOKEN_MXNE=
VITE_ADMIN_ADDRESS=
VITE_FAUCET_SECRET=
VITE_INDEXER_URL=          # Para SSE real-time (no configurado aún en Vercel)
VITE_PINATA_API_KEY=
VITE_PINATA_SECRET=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_RESEND_API_KEY=
```

## PRs mergeados (histórico completo)

| PR | Autor | Contenido |
|---|---|---|
| #23 | Ejirowebfi | Seguridad contrato (CEI, overfunding cap, bounds check) |
| #22 | Dennis-Ritchie1 | Indexer on-chain (bimex-indexer) |
| #24 | Dennis-Ritchie1 | UI mobile responsive |
| #25 | Ejirowebfi | Recompensas / badges |
| #27 | Dennis-Ritchie1 | i18n ES/EN |
| #28 | Dennis-Ritchie1 | Contrato usa IPFS CID (String) en vez de SHA-256 (BytesN<32>) |
| #26 | Ejirowebfi | Sistema de notificaciones email (Resend + Supabase) |
| #29 | JoesWalker | Script deploy Mainnet + env vars |
| #30 | JoesWalker | 19 tests adicionales (cobertura 100%) |
| #34 | Darkdante9 | Documentación técnica v2 |
| #35 | Darkdante9 | Docs onboarding comunidad (docs/) |
| #40 | Zarmaijemimah | Docs proyecto piloto + scripts bash |
| #41 | Zarmaijemimah | Specs página transparencia pública (.kiro/specs/) |
| #32 | JoesWalker | IPFS Pinata integrado en CrearProyecto.jsx |
| #82 | Joseph-1-Duro | Skeleton UI en ListaProyectos, DetalleProyecto, MiCuenta |
| #83 | driftsorbit | SSE real-time updates + public changelog |

## Fixes aplicados directamente en main

- **Navbar móvil**: padding `clamp(14px, 4vw, 48px)`, prop `inNavbar` en `ConectarWallet`, badge TESTNET oculto en móvil
- **IPFS en CrearProyecto**: `src/utils/ipfs.js` creado — `subirConFallback` con `Promise.all`, CIDs concatenados `"CID1|CID2|CID3"`, fallback a SHA-256

## Notas importantes

- `doc_cid` es `String` en el contrato (migrado desde `BytesN<32>` SHA-256)
- Si IPFS configurado: `docCid = "CID1|CID2|CID3"` (3 docs separados por `|`)
- Si Pinata no está configurado: fallback automático a SHA-256 hex
- Vercel despliega desde `main`. Root directory debe ser `bimex-frontend/` en el dashboard
- Tests del contrato: 39 tests, 0 failures (`cd bimex && cargo test`)
- Branch protection activo en main — pushes directos requieren bypass de admin

## Arquitectura SSE (mergeada en PR #83, pendiente migrar a Vercel+Supabase)

El PR #83 implementó SSE vía proceso Node.js persistente. **Decisión**: migrar a Vercel Cron Jobs + Supabase Realtime para evitar servidor adicional.

- `bimex-indexer/sse.js`: Set de clientes en memoria → **eliminar**
- `bimex-indexer/api.js`: GET /sse → **reemplazar por Supabase Realtime**
- Frontend `ListaProyectos.jsx`: `EventSource` → **reemplazar por `supabase.channel()`**

## Pendientes

- [ ] **Migrar indexer a Vercel Cron Jobs** + **Supabase Realtime** en frontend (en progreso)
- [ ] **Agregar `VITE_INDEXER_URL`** en Vercel una vez el indexer esté desplegado
- [ ] Canvas Modelo de Negocio, TRL, Matriz de Vigilancia Tecnológica (mencionados por el usuario)
- [ ] Registro/asesoría legal de la idea (en proceso con asesores)
- [ ] Participar en Stellar Community Fund (mejor alternativa a Emprende Joven)
