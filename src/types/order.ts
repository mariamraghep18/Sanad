export type ReviewState = 'from_source' | 'needs_review' | 'missing' | 'user_edited';

export type InputAssessment = 'single_order' | 'multiple_orders' | 'not_an_order' | 'unreadable';

export type FulfillmentType = 'delivery' | 'pickup';

export type OrderStatus = 'draft' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface ProposedField<T> {
  value: T | null;
  evidence: string | null;
  review_state: ReviewState;
}

export interface ProposedItem {
  id: string;
  name: ProposedField<string>;
  color: ProposedField<string>;
  size: ProposedField<string>;
  quantity: ProposedField<number>;
  unit_price_cents: ProposedField<number>; // minor units (piasters: 100 = 1 EGP)
  catalog_product_id?: string | null;
}

export interface SourceData {
  id: string;
  type: 'text' | 'image' | 'audio';
  content: string; // raw text, or base64 / blob url / placeholder reference
  fileName?: string;
  fileSize?: number;
  createdAt: string;
}

export interface OrderReview {
  id: string;
  sourceId: string;
  workspaceId: string;
  inputAssessment: InputAssessment;
  warnings: string[];
  missingFields: string[];
  
  // Customer & fulfillment proposed fields
  customerName: ProposedField<string>;
  phone: ProposedField<string>;
  address: ProposedField<string>;
  fulfillment: ProposedField<FulfillmentType>;
  shippingFeeCents: ProposedField<number>;
  notes: ProposedField<string>;
  discountCents: number; // merchant discount in minor units

  items: ProposedItem[];
  
  createdAt: string;
  updatedAt: string;
  approvedOrderId?: string | null;
  isDraftSaved: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  color?: string | null;
  size?: string | null;
  quantity: number;
  unitPriceCents: number; // minor units
  totalCents: number;
  catalogProductId?: string | null;
}

export interface OrderEvent {
  id: string;
  orderId: string;
  type: 'created' | 'draft_saved' | 'approved' | 'status_changed' | 'printed' | 'text_copied';
  fromStatus?: OrderStatus;
  toStatus?: OrderStatus;
  note: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. BAY-1001
  workspaceId: string;
  sourceId: string;
  reviewId?: string;
  status: OrderStatus;
  customerName: string | null;
  phone: string | null;
  address: string | null;
  fulfillment: FulfillmentType;
  items: OrderItem[];
  subtotalCents: number | null; // null if any item price is missing
  shippingFeeCents: number | null; // null if missing
  discountCents: number;
  totalCents: number | null; // null if missing
  currency: 'EGP';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
}

export interface ProductCatalogItem {
  id: string;
  name: string;
  sku: string;
  referencePriceCents: number; // 100 = 1 EGP
  category: string;
  inStock: boolean;
  colors: string[];
  sizes: string[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  defaultAddress?: string;
  ordersCount: number;
  totalSpentCents: number;
  createdAt: string;
}
