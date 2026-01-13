
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStructured?: boolean;
  structuredData?: StructuredResponse;
}

export interface StructuredResponse {
  summary: string;
  checklist: string[];
  legalCitation?: string;
  quickActions?: string[];
  procedureLink: string;
  thematicLink: string;
  retrievedProcedures?: RetrievedProcedure[];
}

export interface HistoryItem {
  id: string;
  title: string;
  category: string;
  date: number;
}

export interface RetrievedProcedure {
  id: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  similarity?: number | null;
  thematicId?: string | null;
  procedureLink?: string | null;
  thematicLink?: string | null;
}

export enum Category {
  Family = 'Family',
  Transport = 'Transport',
  Health = 'Health',
  Employment = 'Employment',
  Property = 'Property',
  General = 'General'
}
