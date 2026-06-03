// ============================================================
// MergeKit — /api/flavors
// GET  — vraća sve flavor aliases iz Supabase + JSON fallback
// POST — dodaje ili proširuje aliases za dati canonical
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import flavorData from '@/lib/flavorAliases.json';
import type { FlavorEntry } from '@/lib/normalizer';

/** Service-role klijent (zaobilazi RLS za server-side upise) */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Koristi service role key ako postoji, inače anon key (RLS mora da dozvoli)
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient<Database>(url, key);
}

// ─── GET /api/flavors ────────────────────────────────────────

export async function GET() {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('flavor_aliases')
      .select('canonical, aliases')
      .order('canonical');

    if (error) {
      // Tabela možda još ne postoji — vrati samo JSON fallback
      console.warn('[/api/flavors GET] Supabase error:', error.message);
      return NextResponse.json({ entries: flavorData as FlavorEntry[] });
    }

    // Spoji: JSON fallback + Supabase (Supabase ima prioritet)
    const jsonEntries = flavorData as FlavorEntry[];
    const supabaseMap = new Map<string, string[]>(
      (data ?? []).map((r) => [r.canonical.toLowerCase(), r.aliases])
    );

    // Počni sa JSON entries, ali zamijeni aliases iz Supabase ako postoje
    const merged: FlavorEntry[] = jsonEntries.map((entry) => {
      const key = entry.canonical.toLowerCase();
      if (supabaseMap.has(key)) {
        // Supabase aliases dopunjuju JSON aliases (union, bez duplikata)
        const supabaseAliases = supabaseMap.get(key)!;
        const combined = [...new Set([...entry.aliases, ...supabaseAliases])];
        supabaseMap.delete(key); // označi kao obrađen
        return { ...entry, aliases: combined };
      }
      return entry;
    });

    // Dodaj Supabase-only entries koji nisu u JSON-u
    for (const [canonical, aliases] of supabaseMap) {
      merged.push({ canonical, aliases });
    }

    return NextResponse.json({ entries: merged });
  } catch (err) {
    console.error('[/api/flavors GET]', err);
    // Graceful fallback — vrati JSON
    return NextResponse.json({ entries: flavorData as FlavorEntry[] });
  }
}

// ─── POST /api/flavors ───────────────────────────────────────

interface PostBody {
  canonical: string; // postojeći canonical naziv ukusa
  alias: string;     // novi alias koji treba dodati
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<PostBody>;
    const canonical = typeof body.canonical === 'string' ? body.canonical.trim() : '';
    const alias     = typeof body.alias     === 'string' ? body.alias.trim()     : '';

    if (!canonical || !alias) {
      return NextResponse.json(
        { error: 'canonical i alias su obavezni' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Provjeri da li canonical već postoji
    const { data: existing } = await supabase
      .from('flavor_aliases')
      .select('id, aliases')
      .ilike('canonical', canonical)
      .maybeSingle();

    if (existing) {
      // Dodaj alias u postojeći red (upsert)
      const newAliases = [...new Set([...existing.aliases, alias.toLowerCase()])];
      const { error } = await supabase
        .from('flavor_aliases')
        .update({ aliases: newAliases })
        .eq('id', existing.id);

      if (error) throw error;
      return NextResponse.json({ ok: true, action: 'updated', canonical, aliases: newAliases });
    } else {
      // Novi canonical — umetni
      const { error } = await supabase
        .from('flavor_aliases')
        .insert({ canonical, aliases: [alias.toLowerCase()] });

      if (error) throw error;
      return NextResponse.json({ ok: true, action: 'inserted', canonical, aliases: [alias.toLowerCase()] });
    }
  } catch (err) {
    console.error('[/api/flavors POST]', err);
    return NextResponse.json({ error: 'Greška pri čuvanju' }, { status: 500 });
  }
}
