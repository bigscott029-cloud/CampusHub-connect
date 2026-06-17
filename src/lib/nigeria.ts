export type CampusAudienceType = "student" | "agent_trader" | "community";

export interface NigeriaStateOption {
  state: string;
  region: string;
  accentColor: string;
  prompt: string;
}

const regionAccents: Record<string, string> = {
  "North Central": "#2563eb",
  "North East": "#ca8a04",
  "North West": "#16a34a",
  "South East": "#7c3aed",
  "South South": "#be123c",
  "South West": "#0f766e",
};

const stateRegionPairs: Array<[string, string]> = [
  ["Abia", "South East"],
  ["Adamawa", "North East"],
  ["Akwa Ibom", "South South"],
  ["Anambra", "South East"],
  ["Bauchi", "North East"],
  ["Bayelsa", "South South"],
  ["Benue", "North Central"],
  ["Borno", "North East"],
  ["Cross River", "South South"],
  ["Delta", "South South"],
  ["Ebonyi", "South East"],
  ["Edo", "South South"],
  ["Ekiti", "South West"],
  ["Enugu", "South East"],
  ["FCT Abuja", "North Central"],
  ["Gombe", "North East"],
  ["Imo", "South East"],
  ["Jigawa", "North West"],
  ["Kaduna", "North West"],
  ["Kano", "North West"],
  ["Katsina", "North West"],
  ["Kebbi", "North West"],
  ["Kogi", "North Central"],
  ["Kwara", "North Central"],
  ["Lagos", "South West"],
  ["Nasarawa", "North Central"],
  ["Niger", "North Central"],
  ["Ogun", "South West"],
  ["Ondo", "South West"],
  ["Osun", "South West"],
  ["Oyo", "South West"],
  ["Plateau", "North Central"],
  ["Rivers", "South South"],
  ["Sokoto", "North West"],
  ["Taraba", "North East"],
  ["Yobe", "North East"],
  ["Zamfara", "North West"],
];

export const nigeriaStates: NigeriaStateOption[] = stateRegionPairs.map(([state, region]) => ({
  state,
  region,
  accentColor: regionAccents[region],
  prompt: `${region} community lane for CampusHub agents, traders, students, and local members around ${state}.`,
}));

export const getNigeriaStateOption = (state: string) =>
  nigeriaStates.find((option) => option.state === state);
