import { Storage } from "../interfaces/storage";

export function filterStoragesByResidueLimit(storages: Storage[]): Storage[] {
  return storages.filter(storage => storage.attributes.residueLimit ? storage.attributes.weight > storage.attributes.residueLimit : true);
}
