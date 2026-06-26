// 2026 FIFA World Cup — verified structural facts.
// Hosts, dates, format, venues are confirmed by FIFA.
// Group draw / fixtures intentionally left as placeholders ("TBD") because
// they require a live data source — see README in /predictions page.

export const TOURNAMENT = {
  name: "FIFA World Cup 2026",
  hosts: ["United States", "Canada", "Mexico"],
  startDate: "2026-06-11",
  endDate: "2026-07-19",
  teams: 48,
  groups: 12,
  matches: 104,
  finalVenue: "MetLife Stadium, New Jersey",
  openingVenue: "Estadio Azteca, Mexico City",
};

export const HOST_CITIES = [
  { city: "Atlanta", country: "USA", venue: "Mercedes-Benz Stadium" },
  { city: "Boston", country: "USA", venue: "Gillette Stadium" },
  { city: "Dallas", country: "USA", venue: "AT&T Stadium" },
  { city: "Houston", country: "USA", venue: "NRG Stadium" },
  { city: "Kansas City", country: "USA", venue: "Arrowhead Stadium" },
  { city: "Los Angeles", country: "USA", venue: "SoFi Stadium" },
  { city: "Miami", country: "USA", venue: "Hard Rock Stadium" },
  { city: "New York/New Jersey", country: "USA", venue: "MetLife Stadium" },
  { city: "Philadelphia", country: "USA", venue: "Lincoln Financial Field" },
  { city: "San Francisco Bay Area", country: "USA", venue: "Levi's Stadium" },
  { city: "Seattle", country: "USA", venue: "Lumen Field" },
  { city: "Toronto", country: "Canada", venue: "BMO Field" },
  { city: "Vancouver", country: "Canada", venue: "BC Place" },
  { city: "Guadalajara", country: "Mexico", venue: "Estadio Akron" },
  { city: "Mexico City", country: "Mexico", venue: "Estadio Azteca" },
  { city: "Monterrey", country: "Mexico", venue: "Estadio BBVA" },
];

// Qualified teams confirmed via FIFA confederation slots (auto + playoff).
// Hosts auto-qualify. Listing only confirmed automatic / host slots here;
// rest depend on live qualifying results.
export const CONFIRMED_TEAMS = [
  { name: "United States", confederation: "CONCACAF", note: "Host" },
  { name: "Canada", confederation: "CONCACAF", note: "Host" },
  { name: "Mexico", confederation: "CONCACAF", note: "Host" },
];

export const GROUPS = Array.from({ length: 12 }, (_, i) => ({
  id: String.fromCharCode(65 + i), // A..L
  teams: ["TBD", "TBD", "TBD", "TBD"],
}));

export const FORMAT_NOTES = [
  "48 teams divided into 12 groups of 4.",
  "Top 2 from each group + 8 best third-placed teams advance to a 32-team Round of 32.",
  "Single-elimination knockout from Round of 32 through the Final.",
  "104 total matches across 16 host cities.",
];