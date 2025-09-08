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

export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews_count: number;
  created_at: string;
  gallery: Array<{
    url: string;
    caption?: string;
    order: number;
  }>;
  seller: {
    id: number;
    username: string;
    name: string;
    avatar: string;
    bio: string;
    location: string;
    phone: string;
    website: string;
    years_experience: number;
    rating: number;
  };
  reviews: Array<{
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    user: {
      username: string;
      name: string;
      avatar: string;
    };
  }>;
}

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}