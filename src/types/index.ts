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
  firm?: { id: string; name: string; slug: string; status: string; logoUrl?: string | null } | null;
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
  featured?: boolean;
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

// ---------- Bookings, payments, reviews, departures ----------

export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus =
  | 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'REFUNDED' | 'FAILED' | 'CANCELLED';
export type PaymentProvider = 'MOCK' | 'PAYME' | 'CLICK' | 'UZUM';
export type FirmStatus = 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';

export interface Departure {
  id: string;
  startDate: string;
  endDate?: string | null;
  capacity: number;
  seatsBooked: number;
  priceOverride?: number | null;
  instantConfirm: boolean;
  status?: 'OPEN' | 'CLOSED' | 'CANCELLED';
  _count?: { bookings: number };
}

export interface PaymentSummary {
  id: string;
  status: PaymentStatus;
  amount?: number;
  netAmount?: number;
  currency: Currency;
  provider?: PaymentProvider;
  checkoutUrl?: string;
}

export interface Booking {
  id: string;
  reference: string;
  status: BookingStatus;
  startDate: string;
  peopleCount: number;
  totalPrice: number;
  currency: Currency;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  note?: string | null;
  firmResponse?: string | null;
  createdAt: string;
  tour: { id: string; slug: string; title: Multilingual; images?: string[] };
  departure?: { id: string; startDate: string } | null;
  payment?: PaymentSummary | null;
  review?: { id: string; rating: number } | null;
  user?: { firstName?: string | null; lastName?: string | null; email: string };
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  firmReply?: string | null;
  createdAt: string;
  user: { firstName?: string | null; lastName?: string | null };
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
  data?: Record<string, unknown> | null;
}

// ---------- Firm & admin ----------

export interface FirmProfile {
  id: string;
  name: string;
  slug: string;
  description?: Multilingual;
  logoUrl?: string | null;
  coverUrl?: string | null;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
  status: FirmStatus;
  verifiedAt?: string | null;
  createdAt: string;
  tours: TourCard[];
}

export interface FirmAnalytics {
  firm: { id: string; name: string; slug: string; status: FirmStatus };
  tours: { total: number; published: number };
  bookings: Partial<Record<BookingStatus, number>>;
  upcomingDepartures: number;
  revenue: { settledBookings: number; gross: number; commission: number; payouts: number };
  rating: { avg: number; count: number };
  recentBookings: {
    id: string; reference: string; status: BookingStatus; totalPrice: number;
    currency: Currency; createdAt: string; tour: { title: Multilingual };
  }[];
}

export interface AdminFirm {
  id: string;
  name: string;
  slug: string;
  status: FirmStatus;
  licenseNo?: string | null;
  phone?: string | null;
  createdAt: string;
  verifiedAt?: string | null;
  owner: { email: string; firstName?: string | null; lastName?: string | null };
  _count: { tours: number };
}

export interface AdminStats {
  users: number;
  firms: Partial<Record<FirmStatus, number>>;
  tours: { total: number; published: number };
  bookings: Partial<Record<BookingStatus, number>>;
  revenue: { capturedCount: number; gross: number; commission: number; payouts: number };
}

export interface AdminTour {
  id: string;
  slug: string;
  title: Multilingual;
  status: string;
  featured: boolean;
  featuredUntil?: string | null;
  priceFrom: number;
  currency: Currency;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  firm: { id: string; name: string; slug: string; status: FirmStatus };
}
