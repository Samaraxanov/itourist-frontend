export type Locale = 'uz' | 'ru' | 'en';
export type Multilingual = Partial<Record<Locale, string>>;
export type Currency = 'UZS' | 'USD' | 'EUR';
export type Role = 'USER' | 'FIRM' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  firstName?: string | null;
  lastName?: string | null;
  locale: Locale;
  firm?: { id: string; name: string; slug: string; status: string } | null;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface Lookup {
  id: string;
  slug: string;
  name: Multilingual;
  icon?: string | null;
}

export interface TourCard {
  id: string;
  slug: string;
  title: Multilingual;
  summary?: Multilingual;
  priceFrom: number;
  currency: Currency;
  durationDays: number;
  durationHours?: number | null;
  images: string[];
  ratingAvg: number;
  ratingCount: number;
  languages: Locale[];
  region?: Lookup | null;
  category?: Lookup | null;
  firm?: { id: string; name: string; slug: string; logoUrl?: string | null };
  status?: string;
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface TourFilters {
  q?: string;
  regionId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  language?: Locale;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  pageSize?: number;
}
