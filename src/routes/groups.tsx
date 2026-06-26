import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { fetchTournament } from "@/lib/wcdata.functions";

const tournamentQO = queryOptions({
  queryKey: ["tournament"],
  queryFn: () => fetchTournament(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/groups")({
  head: () => ({
    meta: [
      { title: "Groups — World Cup 2026" },
      { name: "description", content: "Live standings for all 12 groups at the 2026 FIFA World Cup." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(tournamentQO),
  component: GroupsPage,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold">Couldn't load standings</h1>
      <p className="text-muted-foreground mt-2 text-sm">{error.message}</p>
    </main>
  ),
});

function GroupsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="text-4xl font-black">Groups</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Live standings — 12 groups of 4. Top 2 + 8 best third-placed teams advance.
      </p>
      <Suspense fallback={<p className="text-muted-foreground">Loading standings…</p>}>
        <GroupsGrid />
      </Suspense>
    </main>
  );
}

function GroupsGrid() {
  const { data } = useSuspenseQuery(tournamentQO);
  if ("error" in data && data.error) {
    return <div className="text-sm text-destructive">{String(data.error)}</div>;
  }
  if (!data.groups.length) {
    return <div className="text-sm text-muted-foreground">No group data parsed.</div>;
  }
  return (
    <>
      <p className="text-xs text-muted-foreground mb-4">
        Source: Wikipedia · updated {new Date(data.updatedAt).toLocaleString()}
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.groups.map((g) => (
          <div key={g.id} className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="bg-primary text-primary-foreground px-4 py-2 font-bold flex justify-between">
              <span>Group {g.id}</span>
              <span className="text-xs opacity-80">{g.matches.filter(m => m.played).length} played</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="text-left px-3 py-2">#</th>
                  <th className="text-left">Team</th>
                  <th className="px-1 text-center">P</th>
                  <th className="px-1 text-center">W</th>
                  <th className="px-1 text-center">D</th>
                  <th className="px-1 text-center">L</th>
                  <th className="px-1 text-center">GD</th>
                  <th className="px-2 text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {g.standings.map((s) => (
                  <tr key={s.pos} className={`border-b border-border last:border-0 ${s.pos <= 2 ? "bg-primary/5" : ""}`}>
                    <td className="px-3 py-2 text-muted-foreground">{s.pos}</td>
                    <td className="font-medium">{s.team}</td>
                    <td className="text-center">{s.pld}</td>
                    <td className="text-center">{s.w}</td>
                    <td className="text-center">{s.d}</td>
                    <td className="text-center">{s.l}</td>
                    <td className="text-center text-muted-foreground">{s.gd}</td>
                    <td className="text-center font-bold">{s.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {g.matches.length > 0 && (
              <div className="border-t border-border bg-background/40 p-3 space-y-1 text-xs">
                {g.matches.map((m, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground tabular-nums">{m.date.slice(5)}</span>
                    <span className="flex-1 text-right truncate">{m.teamA}</span>
                    <span className={`font-bold tabular-nums px-2 ${m.played ? "text-accent" : "text-muted-foreground"}`}>
                      {m.played ? `${m.scoreA}–${m.scoreB}` : "v"}
                    </span>
                    <span className="flex-1 truncate">{m.teamB}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}