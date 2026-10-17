import {makeSimulationHandler} from '../_shared/ycloud-simulation.mjs';
const env = (name: string) => Deno.env.get(name) || '';
const db = async (path: string, options: {method?: string; prefer?: string; body?: unknown} = {}) => {
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  const response = await fetch(env('SUPABASE_URL') + '/rest/v1/' + path, {
    method: options.method || 'GET',
    headers: {apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json',
      ...(options.prefer ? {Prefer: options.prefer} : {})},
    ...(options.body ? {body: JSON.stringify(options.body)} : {}), signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('database_unavailable');
  return response.status === 204 ? null : response.json();
};
Deno.serve(makeSimulationHandler({env, db}));
