export interface Product {
  name: string;
  price: number;
  variation: number;
  unit: string;
  isLowPrice: boolean;
}

export interface Market {
  id: string;
  label: string;
  icon: string;
  products: Product[];
}

export interface MarketData {
  markets: Market[];
  fetchedAt: string;
  date: string;
  marketDate?: string; // actual market date shown on the site e.g. "03-06-2026"
}
