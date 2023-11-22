import { Meta } from "./common"
import { Storage, StorageData } from "./storage";

export interface OrdersData {
  data: Order[],
  meta: Meta
}

export interface OrderData {
  data: Order,
  meta: Meta
}

export interface Order {
  id: number;
  attributes: OrderAttributes;
}

export interface OrderAttributes {
  name: string;
  itemCount: number;
  date: string;
  dateEnd?: string;
  price: number;
  completed: boolean;
  paid: boolean;
  weight: number;
  modelDesign: number;
  relatedExpenses: number;
  plastic: StorageData;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}