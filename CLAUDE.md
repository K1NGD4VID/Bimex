# Bimex — Contexto para Claude

Plataforma de crowdfunding de impacto social donde el capital de los contribuidores siempre es recuperable, construida sobre Stellar y Soroban. Los rendimientos (CETES + AMM) financian el proyecto; al completarse, cada contribuidor recibe exactamente su inversión original de vuelta.

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

## Variables de entorno clave

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

## URL de producción

- Frontend: https://bimex-frontend.vercel.app
- Indexer: **NO desplegado aún** (ver Pendientes)

## PRs mergeados / trabajo completado

| PR | Descripción | Issues |
|---|---|---|
| #40 | Pinata IPFS + doc_cid on-chain | #39 |
| #41 | `.kiro/specs/` specs de proyecto | — |
| #82 | Skeleton UI en ListaProyectos, DetalleProyecto, MiCuenta | #48 |
| #83 | SSE real-time updates + public changelog | #62, #81 |

## Fixes aplicados directamente en main

- **Navbar móvil**: padding `clamp(14px, 4vw, 48px)`, prop `inNavbar` en `ConectarWallet`, badge TESTNET oculto en móvil
- **IPFS en CrearProyecto**: `subirConFallback` con `Promise.all`, CIDs concatenados `"CID1|CID2|CID3"`, fallback a SHA-256
- **`bimex-frontend/src/utils/ipfs.js`**: creado — `subirAIPFS`, `sha256Archivo`, `subirConFallback`

## Arquitectura SSE (mergeada en PR #83)

- `bimex-indexer/sse.js`: Set de clientes, `agregarCliente`, `eliminarCliente`, `notificarClientes`
- `bimex-indexer/api.js`: `GET /sse` con headers SSE, CORS vía `FRONTEND_URL`
- `bimex-indexer/index.js`: importa api.js (proceso unificado), llama `notificarClientes` tras cada upsert
- `ListaProyectos.jsx`: se suscribe a EventSource si `VITE_INDEXER_URL` está definido (degradación graciosa si no)

## Notas importantes

- `doc_cid` es `String` en el contrato (migrado desde `BytesN<32>` SHA-256)
- Patrón CEI (Checks-Effects-Interactions) aplicado en todos los métodos del contrato
- Branch protection activo en main — los pushes directos requieren bypass de admin
- Vercel debe tener `bimex-frontend/` como Root Directory

## Pendientes

- [ ] **Desplegar `bimex-indexer/`** en Railway / Render / Fly.io para activar SSE en producción
- [ ] **Agregar `VITE_INDEXER_URL`** en Vercel una vez el indexer esté desplegado
- [ ] Canvas Modelo de Negocio, TRL, Matriz de Vigilancia Tecnológica (mencionados por el usuario)
- [ ] Registro/asesoría legal de la idea (en proceso con asesores)
- [ ] Participar en Stellar Community Fund (mejor alternativa a Emprende Joven)
