import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { predictMatch } from "@/lib/predict.functions";

export const Route = createFileRoute("/predict")({
  head: () => ({
    meta: [
      { title: "AI Predictions — World Cup 2026" },
      { name: "description", content: "AI-powered match predictions for the 2026 FIFA World Cup." },
    ],
  }),
  component: PredictPage,
});

function parsePrediction(raw: string) {
  const get = (k: string) => raw.match(new RegExp(`${k}:\\s*(.+)`, "i"))?.[1]?.trim() ?? "";
  return {
    score: get("SCORE"),
    winner: get("WINNER"),
    confidence: get("CONFIDENCE"),
    reasoning: get("REASONING") || raw,
  };
}

function PredictPage() {
  const predict = useServerFn(predictMatch);
  const [teamA, setTeamA] = useState("Argentina");
  const [teamB, setTeamB] = useState("France");
  const [stage, setStage] = useState("Group Stage");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof parsePrediction> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const r = await predict({ data: { teamA, teamB, stage } });
      setResult(parsePrediction(r.raw));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg.includes("402") ? "AI credits exhausted — add credits in workspace billing." : msg.includes("429") ? "Rate limited. Try again in a moment." : "Prediction failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-black mb-2">AI Match Predictor</h1>
      <p className="text-muted-foreground mb-8">Pick any two teams. Lovable AI returns a predicted scoreline, winner, confidence, and reasoning.</p>

      <form onSubmit={onSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Team A</label>
            <input value={teamA} onChange={(e) => setTeamA(e.target.value)} required className="w-full bg-input border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Team B</label>
            <input value={teamB} onChange={(e) => setTeamB(e.target.value)} required className="w-full bg-input border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Stage</label>
          <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full bg-input border border-border rounded-md px-3 py-2">
            {["Group Stage", "Round of 32", "Round of 16", "Quarter-final", "Semi-final", "Final"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-md hover:opacity-90 disabled:opacity-50">
          {loading ? "Analyzing..." : "Predict Match"}
        </button>
      </form>

      {err && <div className="mt-6 p-4 bg-destructive/20 border border-destructive/40 rounded-md text-sm">{err}</div>}

      {result && (
        <div className="mt-6 bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-1">Score</div>
              <div className="text-3xl font-black text-primary">{result.score || "—"}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-1">Winner</div>
              <div className="text-xl font-bold">{result.winner || "—"}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-1">Confidence</div>
              <div className="text-xl font-bold text-accent">{result.confidence || "—"}</div>
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <div className="text-xs uppercase text-muted-foreground mb-2">Reasoning</div>
            <p className="text-sm leading-relaxed">{result.reasoning}</p>
          </div>
          <p className="text-xs text-muted-foreground italic">AI predictions are speculative. Not betting advice.</p>
        </div>
      )}
    </main>
  );
}