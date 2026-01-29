export interface PrintProfile {
  name: string;
  pageSize: string;
  margin: string;
}

const PROFILES: Record<string, PrintProfile> = {
  a4: { name: "a4", pageSize: "A4", margin: "1in,1in,1in,1in" },
  letter: { name: "letter", pageSize: "Letter", margin: "1in,1in,1in,1in" },
  "book-6x9": { name: "book-6x9", pageSize: "6in x 9in", margin: "0.75in,0.8in,0.9in,0.8in" }
};

export function resolveProfile(name?: string): PrintProfile | undefined {
  if (!name) return undefined;
  return PROFILES[name.toLowerCase()];
}

export function listProfiles(): PrintProfile[] {
  return Object.values(PROFILES);
}
