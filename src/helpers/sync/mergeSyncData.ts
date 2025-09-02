import { Filament } from '@/types/Filament';

interface SyncDataStructure {
  local: Filament[];
  regular: Filament[];
}

export const mergeSyncData = (
  localData: SyncDataStructure,
  serverData: SyncDataStructure
): SyncDataStructure => {
  const serverRegularMap = new Map(serverData.regular.map((item) => [item._id, item]));
  const mergedRegular: Filament[] = [];
  const processedServerIds = new Set<string>();

  if (localData.regular && Array.isArray(localData.regular)) {
    for (const localItem of localData.regular) {
      if (localItem?._id && serverRegularMap.has(localItem._id)) {
        // Server data takes precedence in case of conflict
        mergedRegular.push(serverRegularMap.get(localItem._id)!);
        processedServerIds.add(localItem._id);
      } else {
        mergedRegular.push(localItem);
      }
    }
  }

  for (const serverItem of serverData.regular) {
    if (!processedServerIds.has(serverItem._id ?? '')) {
      mergedRegular.push(serverItem);
    }
  }

  // For 'local' data, we'll let the server's version overwrite the local one.
  return { local: serverData.local, regular: mergedRegular };
};
