export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  seller: {
    username: string;
    avatar: string;
    rating: number;
  };
  rating: number;
  reviews: number;
}

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}