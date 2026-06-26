import { createServerFn } from "@tanstack/react-start";
import { getTournamentSnapshot } from "./wcdata.server";

export const fetchTournament = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      return await getTournamentSnapshot();
    } catch (e) {
      return {
        updatedAt: new Date().toISOString(),
        source: "",
        groups: [],
        error: e instanceof Error ? e.message : "Failed to load tournament data",
      };
    }
  },
);