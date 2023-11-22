import { Meta } from "./common";

export interface DirectoriesData {
  data: Directory[],
  meta: Meta
}

export interface DirectoryData {
  data: Directory,
}

export interface Directory {
  id: number;
  attributes: DirectoryAttributes;
}

export interface DirectoryAttributes {
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}