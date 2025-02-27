export interface PouchDBError extends Error {
  status: number;
  name: string;
  message: string;
  reason?: string;
  error?: boolean;
}

export interface InfoSchema {
  version: number;
  updated: number; // Use number for timestamps (milliseconds since epoch)
  synchash: string;
  plan: string;
  revision: number;
}
