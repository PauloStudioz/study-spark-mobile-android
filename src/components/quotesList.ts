
export interface QuoteData {
  text: string;
  author: string;
}

// Import all subgroups
import { mindsetQuotes } from "./mindsetQuotes";
import { jesusQuotes } from "./jesusQuotes";
import { toxicQuotes } from "./toxicQuotes";
import { billionaireQuotes } from "./billionaireQuotes";

export const fallbackQuotes: QuoteData[] = [
  ...mindsetQuotes,
  ...jesusQuotes,
  ...toxicQuotes,
  ...billionaireQuotes,
];
