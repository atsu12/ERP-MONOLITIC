export interface Product {

  id: number;

  name: string;

  brand: string;

  quantity: number;

  track_serial: boolean | null;

  price?: number;

}