import { PouchDBError } from '@/types/PouchDB';

export function isPouchDBError(err: unknown): err is PouchDBError {
  return (
    typeof err === 'object' && err !== null && 'status' in err && 'name' in err && 'message' in err
  );
}
