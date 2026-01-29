export interface FontStacks {
  body: string;
  heading: string;
  mono: string;
  cjk?: string;
  rtl?: string;
}

export interface PrintProfile {
  name: string;
  pageSize: string;
  margin: string;
  columns: number;
  fontStacks: FontStacks;
}

const PROFILES: Record<string, PrintProfile> = {
  a4: {
    name: "a4",
    pageSize: "A4",
    margin: "1in,1in,1in,1in",
    columns: 1,
    fontStacks: {
      body: "Noto Serif",
      heading: "Noto Sans",
      mono: "Noto Sans Mono",
      cjk: "Noto Sans CJK",
      rtl: "Noto Sans Arabic"
    }
  },
  letter: {
    name: "letter",
    pageSize: "Letter",
    margin: "1in,1in,1in,1in",
    columns: 1,
    fontStacks: {
      body: "Noto Serif",
      heading: "Noto Sans",
      mono: "Noto Sans Mono",
      cjk: "Noto Sans CJK",
      rtl: "Noto Sans Arabic"
    }
  },
  "book-6x9": {
    name: "book-6x9",
    pageSize: "6in x 9in",
    margin: "0.75in,0.8in,0.9in,0.8in",
    columns: 1,
    fontStacks: {
      body: "Noto Serif",
      heading: "Noto Sans",
      mono: "Noto Sans Mono",
      cjk: "Noto Sans CJK",
      rtl: "Noto Sans Arabic"
    }
  }
};

export function resolveProfile(name?: string): PrintProfile | undefined {
  if (!name) return undefined;
  return PROFILES[name.toLowerCase()];
}

export function listProfiles(): PrintProfile[] {
  return Object.values(PROFILES);
}
