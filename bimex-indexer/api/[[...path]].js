import { createClient } from '@supabase/supabase-js';

function sb() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

function json(res, status, data) {
  res.status(status).json(data);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });

  const { path = [] } = req.query;
  const [seg0, seg1, seg2] = path;
  const db = sb();

  try {
    // GET /api/proyectos[?estado=X]
    if (seg0 === 'proyectos' && !seg1) {
      let q = db.from('proyectos').select('*').order('id');
      if (req.query.estado) q = q.eq('estado', req.query.estado);
      const { data, error } = await q;
      return error ? json(res, 500, { error: error.message }) : json(res, 200, data);
    }

    // GET /api/proyectos/:id
    if (seg0 === 'proyectos' && seg1 && !seg2) {
      const { data, error } = await db.from('proyectos').select('*').eq('id', seg1).single();
      if (error) return json(res, error.code === 'PGRST116' ? 404 : 500, { error: error.message });
      return json(res, 200, data);
    }

    // GET /api/proyectos/:id/aportaciones
    if (seg0 === 'proyectos' && seg1 && seg2 === 'aportaciones') {
      const { data, error } = await db.from('aportaciones').select('*').eq('proyecto_id', seg1).order('timestamp');
      return error ? json(res, 500, { error: error.message }) : json(res, 200, data);
    }

    // GET /api/backers/:address/aportaciones
    if (seg0 === 'backers' && seg1 && seg2 === 'aportaciones') {
      const { data, error } = await db.from('aportaciones')
        .select('*, proyectos(nombre,estado)').eq('contribuidor', seg1).order('timestamp');
      return error ? json(res, 500, { error: error.message }) : json(res, 200, data);
    }

    // GET /api/eventos[?tipo=X&limit=N]
    if (seg0 === 'eventos' && !seg1) {
      const limit = Math.min(parseInt(req.query.limit ?? '50', 10), 200);
      let q = db.from('eventos').select('*').order('ledger', { ascending: false }).limit(limit);
      if (req.query.tipo) q = q.eq('tipo', req.query.tipo);
      const { data, error } = await q;
      return error ? json(res, 500, { error: error.message }) : json(res, 200, data);
    }

    // GET /api/stats
    if (seg0 === 'stats' && !seg1) {
      const [proyectos, aportaciones] = await Promise.all([
        db.from('proyectos').select('estado,total_aportado,yield_entregado,meta'),
        db.from('aportaciones').select('monto,retirado'),
      ]);
      if (proyectos.error) return json(res, 500, { error: proyectos.error.message });
      const ps = proyectos.data;
      const stats = {
        total_proyectos: ps.length,
        activos:         ps.filter(p => ['EtapaInicial','EnProgreso','Liberado'].includes(p.estado)).length,
        total_aportado:  ps.reduce((s, p) => s + Number(p.total_aportado ?? 0), 0),
        total_yield:     ps.reduce((s, p) => s + Number(p.yield_entregado ?? 0), 0),
        capital_activo:  (aportaciones.data ?? []).filter(a => !a.retirado).reduce((s, a) => s + Number(a.monto ?? 0), 0),
      };
      return json(res, 200, stats);
    }

    json(res, 404, { error: 'Not found' });
  } catch (err) {
    json(res, 500, { error: err.message });
  }
}
