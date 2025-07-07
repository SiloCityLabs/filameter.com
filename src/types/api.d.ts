/**
 * The structure of the data exported from the local PouchDB databases.
 */
export interface ExportedData {
  regular: PouchDB.Core.Document<unknown>[];
  local?: PouchDB.Core.Document<unknown>[];
}

/**
 * Represents the structure of the file stored in the cloud.
 */
export interface SyncFile {
  token: string;
  userData: unknown; // Using unknown as the full structure isn't defined here
  keyType: string;
  data: ExportedData;
  timestamp?: string; // The timestamp of the last sync
}

/**
 * Represents a successful response from the PULL API endpoint.
 */
export interface PullSuccessResponse {
  status: 'success';
  data: SyncFile;
}

/**
 * Represents a successful response from the PUSH API endpoint.
 */
export interface PushSuccessResponse {
  status: 'success';
  message: string;
}

/**
 * Represents a successful response from the CREATE API endpoint that returns a key.
 */
export interface CreateSuccessResponse {
  status: 'success';
  key: string;
}

/**
 * Represents a message response from the CREATE API endpoint.
 */
export interface CreateMessageResponse {
  status: 'message';
  msg: string;
}

/**
 * Represents a successful response from the TIMESTAMP API endpoint.
 */
export interface TimestampSuccessResponse {
  status: 'success';
  timestamp: string;
}

/**
 * Represents a generic error response from the API.
 */
export interface ApiErrorResponse {
  status: 'error';
  error: string;
}

/**
 * A union type representing all possible responses from the PULL API.
 */
export type PullResponse = PullSuccessResponse | ApiErrorResponse;

/**
 * A union type representing all possible responses from the PUSH API.
 */
export type PushResponse = PushSuccessResponse | ApiErrorResponse;

/**
 * A union type representing all possible responses from the CREATE API.
 */
export type CreateResponse = CreateSuccessResponse | CreateMessageResponse | ApiErrorResponse;

/**
 * A union type representing all possible responses from the TIMESTAMP API.
 */
export type TimestampResponse = TimestampSuccessResponse | ApiErrorResponse;
