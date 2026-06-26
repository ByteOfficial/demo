import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { fetchTournament } from "@/lib/wcdata.functions";

const tournamentQO = queryOptions({
  queryKey: ["tournament"],
  queryFn: () => fetchTournament(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Matches — World Cup 2026" },
      { name: "description", content: "All group-stage matches and scores for the 2026 FIFA World Cup." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(tournamentQO),
  component: MatchesPage,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold">Couldn't load matches</h1>
      <p className="text-muted-foreground mt-2 text-sm">{error.message}</p>
    </main>
  ),
});

function MatchesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-black mb-2">Matches</h1>
      <p className="text-muted-foreground mb-8">Group-stage fixtures and live results.</p>
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <MatchList />
      </Suspense>
    </main>
  );
}

function MatchList() {
  const { data } = useSuspenseQuery(tournamentQO);
  if ("error" in data && data.error) {
    return <div className="text-sm text-destructive">{String(data.error)}</div>;
  }
  const all = data.groups
    .flatMap((g) => g.matches.map((m) => ({ ...m, group: g.id })))
    .sort((a, b) => a.date.localeCompare(b.date));

  const byDate: Record<string, typeof all> = {};
  for (const m of all) (byDate[m.date] ||= []).push(m);
  const dates = Object.keys(byDate).sort();

  if (!dates.length) {
    return <div className="text-sm text-muted-foreground">No matches yet.</div>;
  }

  return (
    <div className="space-y-8">
      <p className="text-xs text-muted-foreground">
        Source: Wikipedia · updated {new Date(data.updatedAt).toLocaleString()}
      </p>
      {dates.map((d) => (
        <section key={d}>
          <h2 className="text-sm uppercase tracking-wider text-accent font-semibold mb-3">
            {new Date(d).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </h2>
          <div className="space-y-2">
            {byDate[d].map((m, i) => (
              <div key={i} className="grid grid-cols-[60px_1fr_auto_1fr] items-center gap-3 bg-card border border-border rounded-lg px-4 py-3">
                <span className="text-xs font-bold text-muted-foreground">Grp {m.group}</span>
                <span className="text-right font-medium truncate">{m.teamA}</span>
                <span className={`font-black tabular-nums px-3 ${m.played ? "text-primary" : "text-muted-foreground text-sm"}`}>
                  {m.played ? `${m.scoreA} – ${m.scoreB}` : "vs"}
                </span>
                <span className="font-medium truncate">{m.teamB}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}