// Server-only: scrapes Wikipedia for live World Cup 2026 group stage data.
// In-memory cache (10 min) per server instance.

export interface Standing {
  pos: number;
  team: string;
  pld: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: string;
  pts: number;
}

export interface Match {
  date: string;          // ISO yyyy-mm-dd
  teamA: string;
  teamB: string;
  scoreA: number | null;
  scoreB: number | null;
  played: boolean;
}

export interface Group {
  id: string;            // "A".."L"
  standings: Standing[];
  matches: Match[];
}

export interface TournamentSnapshot {
  updatedAt: string;
  source: string;
  groups: Group[];
}

const WIKI_URL =
  "https://en.wikipedia.org/wiki/2026_FIFA_World_Cup";

let cache: { data: TournamentSnapshot; ts: number } | null = null;
const TTL_MS = 10 * 60 * 1000;

function parseStandings(body: string): Standing[] {
  const re =
    /\|\s*(\d)\s*\|\s*!\[\]\([^)]+\)\[([^\]]+)\][^|]*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*([+\-−]?\d+)\s*\|\s*(\d+)\s*\|/g;
  const out: Standing[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    out.push({
      pos: Number(m[1]),
      team: m[2],
      pld: Number(m[3]),
      w: Number(m[4]),
      d: Number(m[5]),
      l: Number(m[6]),
      gf: Number(m[7]),
      ga: Number(m[8]),
      gd: m[9].replace("−", "-"),
      pts: Number(m[10]),
    });
    if (out.length === 4) break;
  }
  return out;
}

function parseMatches(body: string): Match[] {
  // Walk every "(YYYY-MM-DD)" anchor; the next match-row table line gives teams + score.
  const matches: Match[] = [];
  const dateRe = /\((\d{4}-\d{2}-\d{2})\)/g;
  // Match table row pattern: "| [TeamA](url)![..]() | [SCORE](url) | ![..]()[TeamB](url) |"
  // Also tolerant of "v" for unplayed: "| ... | v | ... |"
  const rowRe =
    /\|\s*\[([^\]]+)\]\([^)]+\)!\[\]\([^)]+\)\s*\|\s*(?:\[(\d+)[–-](\d+)\]\([^)]+\)|v)\s*\|\s*!\[\]\([^)]+\)\[([^\]]+)\]\([^)]+\)\s*\|/g;

  let d: RegExpExecArray | null;
  while ((d = dateRe.exec(body)) !== null) {
    const date = d[1];
    rowRe.lastIndex = d.index;
    const r = rowRe.exec(body);
    // Ensure the row is reasonably close to the date marker
    if (r && r.index - d.index < 1200) {
      const a = Number(r[2]);
      const b = Number(r[3]);
      matches.push({
        date,
        teamA: r[1],
        teamB: r[4],
        scoreA: Number.isFinite(a) ? a : null,
        scoreB: Number.isFinite(b) ? b : null,
        played: Number.isFinite(a) && Number.isFinite(b),
      });
    }
  }
  return matches;
}

function parseTournament(md: string): Group[] {
  const start = md.indexOf("## Group stage");
  const end = md.indexOf("## Knockout stage", start);
  const section = md.slice(start, end === -1 ? undefined : end);
  const parts = section.split(/### (Group [A-L])\n/);
  // [pre, "Group A", body, "Group B", body, ...]
  const groups: Group[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const id = parts[i].replace("Group ", "");
    const body = parts[i + 1] || "";
    groups.push({
      id,
      standings: parseStandings(body),
      matches: parseMatches(body),
    });
  }
  return groups;
}

export async function getTournamentSnapshot(): Promise<TournamentSnapshot> {
  if (cache && Date.now() - cache.ts < TTL_MS) return cache.data;

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY not configured");

  const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: WIKI_URL,
      formats: ["markdown"],
      onlyMainContent: true,
    }),
  });

  if (!res.ok) {
    if (cache) return cache.data;
    throw new Error(`Firecrawl scrape failed: ${res.status}`);
  }

  const json = (await res.json()) as {
    success: boolean;
    data?: { markdown?: string };
  };
  const md = json?.data?.markdown ?? "";
  if (!md) {
    if (cache) return cache.data;
    throw new Error("Empty markdown from source");
  }

  const groups = parseTournament(md);
  const snapshot: TournamentSnapshot = {
    updatedAt: new Date().toISOString(),
    source: WIKI_URL,
    groups,
  };
  cache = { data: snapshot, ts: Date.now() };
  return snapshot;
}