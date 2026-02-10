import { supabase } from '@/src/lib/supabase'

export async function getContent(keys: string[]) {
  const { data, error } = await supabase
    .from('site_content')
    .select('key,value')
    .in('key', keys)

  if (error) throw error

  const map = new Map<string, string>()
  for (const row of data || []) map.set(row.key, row.value)
  return map
}

export async function upsertContent(entries: { key: string; value: string }[]) {
  const payload = entries.map((e) => ({
    key: e.key,
    value: e.value,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('site_content').upsert(payload, { onConflict: 'key' })
  if (error) throw error
}
