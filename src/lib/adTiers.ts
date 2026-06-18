export const adTiers = [
  {
    id: "starter",
    label: "Starter",
    price: 5000,
    priority: 1,
    maxImpressionsPerUser: 6,
    cooldownHours: 24,
    description: "Best for light campus awareness.",
  },
  {
    id: "growth",
    label: "Growth",
    price: 15000,
    priority: 3,
    maxImpressionsPerUser: 8,
    cooldownHours: 18,
    description: "Balanced reach for local sellers and services.",
  },
  {
    id: "premium",
    label: "Premium",
    price: 35000,
    priority: 6,
    maxImpressionsPerUser: 10,
    cooldownHours: 12,
    description: "Higher priority across popup and inline placements.",
  },
  {
    id: "spotlight",
    label: "Spotlight",
    price: 75000,
    priority: 10,
    maxImpressionsPerUser: 12,
    cooldownHours: 8,
    description: "Top priority for urgent launches and major campaigns.",
  },
] as const;

export type AdTierId = typeof adTiers[number]["id"];

export const getAdTier = (id: string) => adTiers.find((tier) => tier.id === id) ?? adTiers[0];
