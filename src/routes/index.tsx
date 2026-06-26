import { createFileRoute, Link } from "@tanstack/react-router";
import { TOURNAMENT, HOST_CITIES, FORMAT_NOTES } from "@/lib/worldcup-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FIFA World Cup 2026 — Tracker & AI Predictions" },
      { name: "description", content: "2026 FIFA World Cup hub: groups, matches, host cities, and AI-powered match predictions." },
      { property: "og:title", content: "FIFA World Cup 2026 Tracker" },
      { property: "og:description", content: "Groups, fixtures, and AI predictions for the 2026 World Cup." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <section className="text-center mb-16">
        <p className="text-accent text-sm uppercase tracking-[0.3em] mb-4">June 11 — July 19, 2026</p>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
          The <span className="text-primary">48-team</span> World Cup
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          The first World Cup hosted by three nations — {TOURNAMENT.hosts.join(", ")} — and the largest ever, with{" "}
          {TOURNAMENT.matches} matches across {HOST_CITIES.length} cities.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Link to="/groups" className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90">View Groups</Link>
          <Link to="/predict" className="px-6 py-3 rounded-md border border-border hover:bg-card">Try AI Predictions</Link>
        </div>
      </section>

      <section className="grid md:grid-cols-4 gap-4 mb-16">
        {[
          { label: "Teams", value: TOURNAMENT.teams },
          { label: "Groups", value: TOURNAMENT.groups },
          { label: "Matches", value: TOURNAMENT.matches },
          { label: "Host Cities", value: HOST_CITIES.length },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-6">
            <div className="text-4xl font-black text-primary">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Format</h2>
          <ul className="space-y-3 text-muted-foreground">
            {FORMAT_NOTES.map((n) => (
              <li key={n} className="flex gap-3"><span className="text-primary">▸</span>{n}</li>
            ))}
          </ul>
        </div>
        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Key Venues</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Opening match</span>
              <span className="font-medium">{TOURNAMENT.openingVenue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Final</span>
              <span className="font-medium">{TOURNAMENT.finalVenue}</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Host Cities</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {HOST_CITIES.map((h) => (
            <div key={h.city} className="bg-card border border-border rounded-lg p-4">
              <div className="font-semibold">{h.city}</div>
              <div className="text-xs text-muted-foreground">{h.country}</div>
              <div className="text-xs text-accent mt-2">{h.venue}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
