import { Meta } from "./common"
import { DirectoryData } from "./directory";

export interface StoragesData {
  data: Storage[],
  meta: Meta
}

export interface StorageData {
  data: Storage,
  meta: Meta
}

export interface Storage {
  id: number;
  attributes: StorageAttributes;
}

export interface StorageAttributes {
  extId: string;
  price: number;
  weight: number;
  residueLimit: number;
  brand: DirectoryData,
  color: DirectoryData,
  type: DirectoryData,
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}