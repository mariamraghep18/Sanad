import { Order, OrderReview, ProductCatalogItem, Customer, OrderStatus, FulfillmentType, OrderEvent } from '../types/order';

const STORAGE_KEYS = {
  ORDERS: 'bay3a_orders_v1',
  REVIEWS: 'bay3a_reviews_v1',
  CUSTOMERS: 'bay3a_customers_v1',
  EVENTS: 'bay3a_events_v1',
  CATALOG: 'bay3a_catalog_v1',
};

export const INITIAL_CATALOG: ProductCatalogItem[] = [
  {
    id: 'prod-tshirt-1',
    name: 'تيشيرت بيسك قطن 100%',
    sku: 'TSH-BSC-01',
    referencePriceCents: 28000, // 280 EGP
    category: 'ملابس رجالي وحريمي',
    inStock: true,
    colors: ['أسود', 'أبيض', 'كحلي', 'رمادي'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'prod-hoodie-1',
    name: 'هودي أوفر سايز شتوي',
    sku: 'HOD-OVR-02',
    referencePriceCents: 55000, // 550 EGP
    category: 'شتاء 2026',
    inStock: true,
    colors: ['أسود', 'كحلي', 'بيج', 'زيتي'],
    sizes: ['M', 'L', 'XL'],
  },
  {
    id: 'prod-pants-1',
    name: 'بنطلون كارجو ميلتون',
    sku: 'PNT-CRG-03',
    referencePriceCents: 42000, // 420 EGP
    category: 'بنطلونات',
    inStock: true,
    colors: ['أسود', 'بيج', 'رمادي'],
    sizes: ['30', '32', '34', '36'],
  },
  {
    id: 'prod-dress-1',
    name: 'فستان صيفي ميدي كاجوال',
    sku: 'DRS-SUM-04',
    referencePriceCents: 65000, // 650 EGP
    category: 'ملابس حريمي',
    inStock: true,
    colors: ['بيج', 'أزرق سماوي', 'وردي'],
    sizes: ['S', 'M', 'L'],
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'سارة عبد الرحمن',
    phone: '01098765432',
    defaultAddress: 'شارع 9، المعادي، القاهرة',
    ordersCount: 3,
    totalSpentCents: 165000,
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'cust-2',
    name: 'أحمد محمود حسن',
    phone: '01123456789',
    defaultAddress: 'عمارات العبور، صلاح سالم، مصر الجديدة',
    ordersCount: 1,
    totalSpentCents: 95000,
    createdAt: '2026-10-22T14:30:00Z',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'BAY-1001',
    workspaceId: 'ws-cairo-main',
    sourceId: 'src-init-1',
    status: 'delivered',
    customerName: 'سارة عبد الرحمن',
    phone: '01098765432',
    address: 'شارع 9، المعادي، القاهرة',
    fulfillment: 'delivery',
    items: [
      {
        id: 'item-101',
        name: 'تيشيرت بيسك قطن 100%',
        color: 'أسود',
        size: 'M',
        quantity: 2,
        unitPriceCents: 28000,
        totalCents: 56000,
        catalogProductId: 'prod-tshirt-1',
      },
    ],
    subtotalCents: 56000,
    shippingFeeCents: 4500, // 45 EGP
    discountCents: 0,
    totalCents: 60500, // 605 EGP
    currency: 'EGP',
    notes: 'الدور الرابع بدون مصعد، التواصل قبل التوصيل بنصف ساعة',
    createdAt: '2026-10-25T11:20:00Z',
    updatedAt: '2026-10-27T16:00:00Z',
    isDraft: false,
  },
  {
    id: 'ord-1002',
    orderNumber: 'BAY-1002',
    workspaceId: 'ws-cairo-main',
    sourceId: 'src-init-2',
    status: 'preparing',
    customerName: 'أحمد محمود حسن',
    phone: '01123456789',
    address: 'عمارات العبور، صلاح سالم، مصر الجديدة',
    fulfillment: 'delivery',
    items: [
      {
        id: 'item-102',
        name: 'هودي أوفر سايز شتوي',
        color: 'كحلي',
        size: 'L',
        quantity: 1,
        unitPriceCents: 55000,
        totalCents: 55000,
        catalogProductId: 'prod-hoodie-1',
      },
      {
        id: 'item-103',
        name: 'بنطلون كارجو ميلتون',
        color: 'أسود',
        size: '34',
        quantity: 1,
        unitPriceCents: 42000,
        totalCents: 42000,
        catalogProductId: 'prod-pants-1',
      },
    ],
    subtotalCents: 97000,
    shippingFeeCents: 5000,
    discountCents: 5000,
    totalCents: 97000,
    currency: 'EGP',
    notes: 'برجاء التأكيد على توفر اللون الكحلي',
    createdAt: '2026-10-30T15:10:00Z',
    updatedAt: '2026-10-31T09:00:00Z',
    isDraft: false,
  },
  {
    id: 'ord-1003',
    orderNumber: 'BAY-1003',
    workspaceId: 'ws-cairo-main',
    sourceId: 'src-init-3',
    status: 'draft',
    customerName: null,
    phone: null,
    address: 'الشيخ زايد - الحي الثامن',
    fulfillment: 'delivery',
    items: [
      {
        id: 'item-104',
        name: 'تيشيرت بيسك قطن 100%',
        color: 'أبيض',
        size: 'XL',
        quantity: 1,
        unitPriceCents: 0,
        totalCents: 0,
        catalogProductId: 'prod-tshirt-1',
      },
    ],
    subtotalCents: null,
    shippingFeeCents: null,
    discountCents: 0,
    totalCents: null,
    currency: 'EGP',
    notes: 'مسودة قيد المراجعة - في انتظار رد العميل على الرقم والسعر',
    createdAt: '2026-10-31T18:45:00Z',
    updatedAt: '2026-10-31T18:45:00Z',
    isDraft: true,
  },
];

export const INITIAL_EVENTS: OrderEvent[] = [
  {
    id: 'evt-1',
    orderId: 'ord-1001',
    type: 'approved',
    toStatus: 'confirmed',
    note: 'تم اعتماد الطلب بعد مراجعة بيانات العميل والأسعار',
    timestamp: '2026-10-25T11:30:00Z',
  },
  {
    id: 'evt-2',
    orderId: 'ord-1001',
    type: 'status_changed',
    fromStatus: 'confirmed',
    toStatus: 'shipped',
    note: 'تم تسليم الشحنة لشركة التوصيل',
    timestamp: '2026-10-26T10:00:00Z',
  },
  {
    id: 'evt-3',
    orderId: 'ord-1001',
    type: 'status_changed',
    fromStatus: 'shipped',
    toStatus: 'delivered',
    note: 'تم استلام العميل للطلب بنجاح وتحصيل المبلغ',
    timestamp: '2026-10-27T16:00:00Z',
  },
  {
    id: 'evt-4',
    orderId: 'ord-1002',
    type: 'approved',
    toStatus: 'confirmed',
    note: 'تم اعتماد الطلب يدوياً بواسطة التاجر',
    timestamp: '2026-10-30T15:20:00Z',
  },
  {
    id: 'evt-5',
    orderId: 'ord-1002',
    type: 'status_changed',
    fromStatus: 'confirmed',
    toStatus: 'preparing',
    note: 'بدء تجهيز القطع وتغليف الشحنة',
    timestamp: '2026-10-31T09:00:00Z',
  },
];

class OrderStorageService {
  private get<T>(key: string, defaultVal: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultVal;
      return JSON.parse(item) as T;
    } catch {
      return defaultVal;
    }
  }

  private set<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage write failed', e);
    }
  }

  public getOrders(): Order[] {
    return this.get<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }

  public getOrder(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id);
  }

  public getCatalog(): ProductCatalogItem[] {
    return this.get<ProductCatalogItem[]>(STORAGE_KEYS.CATALOG, INITIAL_CATALOG);
  }

  public getCustomers(): Customer[] {
    return this.get<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }

  public getEvents(orderId?: string): OrderEvent[] {
    const events = this.get<OrderEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    if (!orderId) return events;
    return events.filter(e => e.orderId === orderId);
  }

  public addEvent(event: Omit<OrderEvent, 'id' | 'timestamp'>): OrderEvent {
    const all = this.getEvents();
    const newEvent: OrderEvent = {
      ...event,
      id: 'evt-' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
    };
    this.set(STORAGE_KEYS.EVENTS, [newEvent, ...all]);
    return newEvent;
  }

  /**
   * Save review as an incomplete draft.
   * Drafts can have null prices, null customer names, null phones, etc.
   */
  public saveReviewAsDraft(review: OrderReview): Order {
    const orders = this.getOrders();
    const now = new Date().toISOString();
    
    // Check if total can be calculated
    let subtotalCents: number | null = 0;
    for (const item of review.items) {
      if (item.unit_price_cents.value === null || item.unit_price_cents.value === undefined) {
        subtotalCents = null;
        break;
      }
      subtotalCents += (item.unit_price_cents.value || 0) * (item.quantity.value || 1);
    }

    const shippingFee = review.shippingFeeCents.value;
    let totalCents: number | null = null;
    if (subtotalCents !== null && (review.fulfillment.value === 'pickup' || shippingFee !== null)) {
      const ship = review.fulfillment.value === 'pickup' ? 0 : (shippingFee || 0);
      totalCents = Math.max(0, subtotalCents + ship - (review.discountCents || 0));
    }

    const existingIndex = orders.findIndex(o => o.reviewId === review.id);
    const orderNumber = existingIndex >= 0 ? orders[existingIndex].orderNumber : `BAY-${1000 + orders.length + 1}`;
    const orderId = existingIndex >= 0 ? orders[existingIndex].id : 'ord-' + Date.now().toString(36);

    const draftOrder: Order = {
      id: orderId,
      orderNumber,
      workspaceId: review.workspaceId,
      sourceId: review.sourceId,
      reviewId: review.id,
      status: 'draft',
      customerName: review.customerName.value,
      phone: review.phone.value,
      address: review.address.value,
      fulfillment: review.fulfillment.value || 'delivery',
      items: review.items.map(it => ({
        id: it.id,
        name: it.name.value || 'منتج غير مسمى',
        color: it.color.value,
        size: it.size.value,
        quantity: it.quantity.value || 1,
        unitPriceCents: it.unit_price_cents.value || 0,
        totalCents: (it.unit_price_cents.value || 0) * (it.quantity.value || 1),
        catalogProductId: it.catalog_product_id,
      })),
      subtotalCents,
      shippingFeeCents: review.fulfillment.value === 'pickup' ? 0 : shippingFee,
      discountCents: review.discountCents || 0,
      totalCents,
      currency: 'EGP',
      notes: review.notes.value,
      createdAt: existingIndex >= 0 ? orders[existingIndex].createdAt : now,
      updatedAt: now,
      isDraft: true,
    };

    if (existingIndex >= 0) {
      orders[existingIndex] = draftOrder;
    } else {
      orders.unshift(draftOrder);
    }
    this.set(STORAGE_KEYS.ORDERS, orders);

    this.addEvent({
      orderId: draftOrder.id,
      type: 'draft_saved',
      note: 'تم حفظ مراجعة الطلب كمسودة غير مكتملة',
    });

    return draftOrder;
  }

  /**
   * Validate if an order review is eligible for official approval.
   * Returns list of blocker reasons if incomplete.
   */
  public getApprovalBlockers(review: OrderReview): string[] {
    const blockers: string[] = [];

    if (!review.customerName.value || review.customerName.value.trim() === '') {
      blockers.push('اسم العميل مطلوب للاعتماد');
    }

    if (!review.phone.value || review.phone.value.trim().length < 8) {
      blockers.push('رقم هاتف العميل غير مدخل أو غير صحيح');
    }

    if (!review.items || review.items.length === 0) {
      blockers.push('يجب إضافة منتج واحد على الأقل');
    } else {
      review.items.forEach((item, index) => {
        const itemNum = index + 1;
        if (!item.name.value || item.name.value.trim() === '') {
          blockers.push(`المنتج #${itemNum}: اسم المنتج مطلوب`);
        }
        if (!item.quantity.value || item.quantity.value < 1) {
          blockers.push(`المنتج #${itemNum}: الكمية يجب أن تكون عدداً صحيحاً موجباً (1 على الأقل)`);
        }
        if (item.unit_price_cents.value === null || item.unit_price_cents.value === undefined) {
          blockers.push(`المنتج #${itemNum}: سعر الوحدة مفقود ويجب تحديده`);
        } else if (item.unit_price_cents.value < 0) {
          blockers.push(`المنتج #${itemNum}: سعر الوحدة لا يمكن أن يكون سالباً`);
        }
      });
    }

    if (review.fulfillment.value === 'delivery') {
      if (!review.address.value || review.address.value.trim().length === 0) {
        blockers.push('عنوان التوصيل مطلوب لطلبات الشحن');
      }
      if (review.shippingFeeCents.value === null || review.shippingFeeCents.value === undefined) {
        blockers.push('مصاريف الشحن غير محددة (يمكن أن تكون 0 ج.م كشحن مجاني، لكن لا تترك فارغة)');
      }
    }

    return blockers;
  }

  /**
   * Explicit approval of order.
   * Atomic operation resulting in a confirmed Order.
   */
  public approveReview(review: OrderReview): { order?: Order; error?: string } {
    const blockers = this.getApprovalBlockers(review);
    if (blockers.length > 0) {
      return { error: blockers.join(' • ') };
    }

    const orders = this.getOrders();
    const now = new Date().toISOString();

    let subtotalCents = 0;
    const finalItems = review.items.map(it => {
      const q = it.quantity.value || 1;
      const unit = it.unit_price_cents.value || 0;
      const tot = q * unit;
      subtotalCents += tot;
      return {
        id: it.id,
        name: it.name.value || 'منتج',
        color: it.color.value,
        size: it.size.value,
        quantity: q,
        unitPriceCents: unit,
        totalCents: tot,
        catalogProductId: it.catalog_product_id,
      };
    });

    const shippingFee = review.fulfillment.value === 'pickup' ? 0 : (review.shippingFeeCents.value || 0);
    const discount = Math.min(review.discountCents || 0, subtotalCents + shippingFee);
    const totalCents = Math.max(0, subtotalCents + shippingFee - discount);

    const existingIndex = orders.findIndex(o => o.reviewId === review.id);
    const orderNumber = existingIndex >= 0 ? orders[existingIndex].orderNumber : `BAY-${1000 + orders.length + 1}`;
    const orderId = existingIndex >= 0 ? orders[existingIndex].id : 'ord-' + Date.now().toString(36);

    const confirmedOrder: Order = {
      id: orderId,
      orderNumber,
      workspaceId: review.workspaceId,
      sourceId: review.sourceId,
      reviewId: review.id,
      status: 'confirmed',
      customerName: review.customerName.value,
      phone: review.phone.value,
      address: review.fulfillment.value === 'pickup' ? null : review.address.value,
      fulfillment: review.fulfillment.value || 'delivery',
      items: finalItems,
      subtotalCents,
      shippingFeeCents: shippingFee,
      discountCents: discount,
      totalCents,
      currency: 'EGP',
      notes: review.notes.value,
      createdAt: existingIndex >= 0 ? orders[existingIndex].createdAt : now,
      updatedAt: now,
      isDraft: false,
    };

    if (existingIndex >= 0) {
      orders[existingIndex] = confirmedOrder;
    } else {
      orders.unshift(confirmedOrder);
    }
    this.set(STORAGE_KEYS.ORDERS, orders);

    // Update or register customer
    this.recordCustomerOrder(confirmedOrder);

    this.addEvent({
      orderId: confirmedOrder.id,
      type: 'approved',
      toStatus: 'confirmed',
      note: 'تم تدقيق واعتماد الطلب بنجاح ونقله إلى قائمة الطلبات المؤكدة',
    });

    return { order: confirmedOrder };
  }

  /**
   * Update order status following the strict state machine
   */
  public updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): { success: boolean; error?: string } {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return { success: false, error: 'الطلب غير موجود' };

    const order = orders[index];
    const valid = this.isTransitionValid(order.status, newStatus, order.fulfillment);
    if (!valid) {
      return {
        success: false,
        error: `لا يمكن نقل الطلب مباشرة من حالة "${this.getStatusLabel(order.status)}" إلى "${this.getStatusLabel(newStatus)}"`,
      };
    }

    const prevStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    if (newStatus !== 'draft') {
      order.isDraft = false;
    }

    orders[index] = order;
    this.set(STORAGE_KEYS.ORDERS, orders);

    this.addEvent({
      orderId: order.id,
      type: 'status_changed',
      fromStatus: prevStatus,
      toStatus: newStatus,
      note: note || `تغيرت حالة الطلب إلى ${this.getStatusLabel(newStatus)}`,
    });

    return { success: true };
  }

  private isTransitionValid(from: OrderStatus, to: OrderStatus, fulfillment: FulfillmentType): boolean {
    if (from === to) return true;
    if (from === 'delivered' || from === 'cancelled') return false; // terminal

    // Anyone can be cancelled before delivery
    if (to === 'cancelled') return true;

    if (fulfillment === 'delivery') {
      if (from === 'draft' && to === 'confirmed') return true;
      if (from === 'confirmed' && to === 'preparing') return true;
      if (from === 'preparing' && to === 'shipped') return true;
      if (from === 'shipped' && to === 'delivered') return true;
      return false;
    } else {
      // Pickup
      if (from === 'draft' && to === 'confirmed') return true;
      if (from === 'confirmed' && to === 'preparing') return true;
      if (from === 'preparing' && to === 'delivered') return true;
      return false;
    }
  }

  private recordCustomerOrder(order: Order) {
    if (!order.phone || !order.customerName) return;
    const customers = this.getCustomers();
    const existing = customers.find(c => c.phone === order.phone);
    const now = new Date().toISOString();

    if (existing) {
      existing.ordersCount += 1;
      existing.totalSpentCents += (order.totalCents || 0);
      if (order.address) existing.defaultAddress = order.address;
    } else {
      customers.push({
        id: 'cust-' + Date.now().toString(36),
        name: order.customerName,
        phone: order.phone,
        defaultAddress: order.address || undefined,
        ordersCount: 1,
        totalSpentCents: order.totalCents || 0,
        createdAt: now,
      });
    }
    this.set(STORAGE_KEYS.CUSTOMERS, customers);
  }

  public getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'confirmed': return 'تم التأكيد';
      case 'preparing': return 'جاري التجهيز';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
    }
  }

  /**
   * Protected CSV export with formula injection mitigation
   */
  public generateSafeCsv(orders: Order[]): string {
    const sanitize = (text: string | null | undefined): string => {
      if (!text) return '""';
      let clean = String(text).replace(/"/g, '""');
      // Protect against spreadsheet formula injection: =, +, -, @, tab, cr
      if (/^[=\+\-@\t\r]/.test(clean)) {
        clean = "'" + clean;
      }
      return `"${clean}"`;
    };

    const headers = [
      'رقم الطلب',
      'الحالة',
      'العميل',
      'الهاتف',
      'نوع الاستلام',
      'العنوان',
      'عدد الأصناف',
      'المجموع الفرعي (ج.م)',
      'مصاريف الشحن (ج.م)',
      'الخصم (ج.م)',
      'الإجمالي (ج.م)',
      'تاريخ الإنشاء',
    ];

    const rows = orders.map(o => {
      const subtotal = o.subtotalCents !== null ? (o.subtotalCents / 100).toFixed(2) : 'غير محدد';
      const shipping = o.shippingFeeCents !== null ? (o.shippingFeeCents / 100).toFixed(2) : 'غير محدد';
      const discount = (o.discountCents / 100).toFixed(2);
      const total = o.totalCents !== null ? (o.totalCents / 100).toFixed(2) : 'غير محدد';
      const fulfillmentText = o.fulfillment === 'delivery' ? 'شحن وتوصيل' : 'استلام من الفرع';

      return [
        sanitize(o.orderNumber),
        sanitize(this.getStatusLabel(o.status)),
        sanitize(o.customerName || 'غير مسجل'),
        sanitize(o.phone || 'غير مسجل'),
        sanitize(fulfillmentText),
        sanitize(o.address || '-'),
        o.items.reduce((acc, it) => acc + it.quantity, 0),
        subtotal,
        shipping,
        discount,
        total,
        sanitize(new Date(o.createdAt).toLocaleString('ar-EG')),
      ].join(',');
    });

    // UTF-8 BOM for Arabic support in Excel
    return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  }

  /**
   * Confirmation message for WhatsApp / SMS copy
   */
  public generateOrderConfirmationText(order: Order): string {
    const itemsList = order.items
      .map((it, idx) => `• ${it.name} ${it.color ? `(لون: ${it.color})` : ''} ${it.size ? `(مقاس: ${it.size})` : ''} - عدد: ${it.quantity} × ${(it.unitPriceCents / 100)} ج.م`)
      .join('\n');

    const totalText = order.totalCents !== null ? `${(order.totalCents / 100)} ج.م` : 'قيد المراجعة';
    const shippingText = order.fulfillment === 'pickup' 
      ? 'استلام من مقر المتجر' 
      : `${order.address || 'العنوان المسجل'} (الشحن: ${order.shippingFeeCents !== null ? (order.shippingFeeCents / 100) + ' ج.م' : 'يُحدد'})`;

    return `أهلاً يا ${order.customerName || 'فندم'} 👋
تم تأكيد طلبك بنجاح من متجرنا! 🎉
رقم الطلب: ${order.orderNumber}

تفاصيل الأصناف:
${itemsList}

طريقة الاستلام: ${shippingText}
الإجمالي المطلوب عند الاستلام: ${totalText}

شكراً لثقتك بنا! سنوافيك بتحديث عند خروج الشحنة. 🚚`;
  }
}

export const orderStorage = new OrderStorageService();
