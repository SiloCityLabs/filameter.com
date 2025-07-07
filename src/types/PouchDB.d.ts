export interface PouchDBError extends Error {
  status: number;
  name: string;
  message: string;
  reason?: string;
  error?: boolean;
}

export interface InfoSchema {
  version: number;
  updated: number;
  synchash: string;
  plan: string;
  revision: number;
}
