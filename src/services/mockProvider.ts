import { OrderReview, ProposedItem, InputAssessment, SourceData } from '../types/order';

export const SYNTHETIC_DEMO_TEXT = 'عايزة تيشيرت أسود مقاس M، قطعة واحدة، والشحن للمعادي.';

export const SAMPLE_INPUTS = [
  {
    id: 'demo-1',
    title: 'الرسالة القياسية (مطلوب المرحلة الأولى)',
    text: 'عايزة تيشيرت أسود مقاس M، قطعة واحدة، والشحن للمعادي.',
    expectedSummary: 'تيشيرت أسود M (1) - شحن للمعادي - بدون اسم ورقم وسعر',
  },
  {
    id: 'demo-2',
    title: 'رسالة مكتملة البيانات (سريعة للاعتماد)',
    text: 'سلام عليكم، محتاج هودي كحلي مقاس L قطعتين بسعر 450ج للقطعة، الاسم: محمد إبراهيم، الرقم: 01012345678، التوصيل لمدينة نصر، مصاريف الشحن 50ج.',
    expectedSummary: 'هودي كحلي L (2) - محمد إبراهيم - مدينة نصر - مكتمل',
  },
  {
    id: 'demo-3',
    title: 'رسالة ملتبسة (طلبان في رسالة واحدة - تحذير)',
    text: 'عايزة دريس بيج مقاس S لاختي في مصر الجديدة، وصاحبتي عايزة بنطلون أسود مقاس 32 في الدقي.',
    expectedSummary: 'يكتشف وجود أكثر من طلب في نفس الرسالة ويطلب الفصل',
  },
];

/**
 * Deterministic extraction according to Bay3a Phase 1 specifications.
 * Strictly adheres to rule: AI output is a proposal; missing values remain null.
 */
export function extractOrderDemo(source: SourceData): OrderReview {
  const content = source.content.trim();
  const reviewId = 'rev-' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  // If text contains multiple orders
  if (content.includes('لاختي') && content.includes('وصاحبتي') || (content.includes('في مصر الجديدة') && content.includes('في الدقي'))) {
    return {
      id: reviewId,
      sourceId: source.id,
      workspaceId: 'ws-cairo-main',
      inputAssessment: 'multiple_orders' as InputAssessment,
      warnings: [
        'تم رصد أكثر من طلب لعنوانين أو مستلمين مختلفين في نفس الرسالة.',
        'القاعدة: لا يمكن دمج طلبين منفصلين تلقائياً. يُنصح بفصل كل طلب على حدة أو إدخاله يدوياً.'
      ],
      missingFields: ['customerName', 'phone', 'items'],
      customerName: { value: null, evidence: null, review_state: 'missing' },
      phone: { value: null, evidence: null, review_state: 'missing' },
      address: { value: 'مصر الجديدة / الدقي', evidence: 'في مصر الجديدة... في الدقي', review_state: 'needs_review' },
      fulfillment: { value: 'delivery', evidence: null, review_state: 'needs_review' },
      shippingFeeCents: { value: null, evidence: null, review_state: 'missing' },
      notes: { value: 'الرسالة تحتوي على طلبين منفصلين يحتاجان تجزئة', evidence: content, review_state: 'needs_review' },
      discountCents: 0,
      items: [
        {
          id: 'item-1',
          name: { value: 'دريس بيج', evidence: 'دريس بيج', review_state: 'from_source' },
          color: { value: 'بيج', evidence: 'بيج', review_state: 'from_source' },
          size: { value: 'S', evidence: 'مقاس S', review_state: 'from_source' },
          quantity: { value: 1, evidence: null, review_state: 'needs_review' },
          unit_price_cents: { value: null, evidence: null, review_state: 'missing' },
          catalog_product_id: null,
        },
        {
          id: 'item-2',
          name: { value: 'بنطلون أسود', evidence: 'بنطلون أسود', review_state: 'from_source' },
          color: { value: 'أسود', evidence: 'أسود', review_state: 'from_source' },
          size: { value: '32', evidence: 'مقاس 32', review_state: 'from_source' },
          quantity: { value: 1, evidence: null, review_state: 'needs_review' },
          unit_price_cents: { value: null, evidence: null, review_state: 'missing' },
          catalog_product_id: null,
        }
      ],
      createdAt: now,
      updatedAt: now,
      isDraftSaved: false,
    };
  }

  // Check if complete demo
  if (content.includes('محمد إبراهيم') || content.includes('01012345678')) {
    return {
      id: reviewId,
      sourceId: source.id,
      workspaceId: 'ws-cairo-main',
      inputAssessment: 'single_order' as InputAssessment,
      warnings: [],
      missingFields: [],
      customerName: { value: 'محمد إبراهيم', evidence: 'الاسم: محمد إبراهيم', review_state: 'from_source' },
      phone: { value: '01012345678', evidence: 'الرقم: 01012345678', review_state: 'from_source' },
      address: { value: 'مدينة نصر', evidence: 'التوصيل لمدينة نصر', review_state: 'from_source' },
      fulfillment: { value: 'delivery', evidence: 'التوصيل', review_state: 'from_source' },
      shippingFeeCents: { value: 5000, evidence: 'مصاريف الشحن 50ج', review_state: 'from_source' },
      notes: { value: null, evidence: null, review_state: 'from_source' },
      discountCents: 0,
      items: [
        {
          id: 'item-1',
          name: { value: 'هودي كحلي', evidence: 'هودي كحلي', review_state: 'from_source' },
          color: { value: 'كحلي', evidence: 'كحلي', review_state: 'from_source' },
          size: { value: 'L', evidence: 'مقاس L', review_state: 'from_source' },
          quantity: { value: 2, evidence: 'قطعتين', review_state: 'from_source' },
          unit_price_cents: { value: 45000, evidence: 'بسعر 450ج للقطعة', review_state: 'from_source' },
          catalog_product_id: 'prod-hoodie-1',
        }
      ],
      createdAt: now,
      updatedAt: now,
      isDraftSaved: false,
    };
  }

  // Default synthetic demo (Matches Section 2 of prompt exactly)
  // "عايزة تيشيرت أسود مقاس M، قطعة واحدة، والشحن للمعادي."
  // Expected proposal: product تيشيرت, color أسود, size M, quantity 1,
  // address المعادي marked needs_review; name, phone and prices missing.
  return {
    id: reviewId,
    sourceId: source.id,
    workspaceId: 'ws-cairo-main',
    inputAssessment: 'single_order' as InputAssessment,
    warnings: [
      'الاسم ورقم هاتف العميل غير مذكورين بالرسالة.',
      'سعر الوحدة للمنتج غير مذكور بالرسالة ويجب تحديده قبل الاعتماد.',
      'عنوان الشحن مذكور كمنطقة عامة (المعادي) ويحتاج تدقيق العنوان التفصيلي ورسوم الشحن.'
    ],
    missingFields: ['customerName', 'phone', 'unit_price_cents', 'shippingFeeCents'],
    customerName: {
      value: null,
      evidence: null,
      review_state: 'missing',
    },
    phone: {
      value: null,
      evidence: null,
      review_state: 'missing',
    },
    address: {
      value: 'المعادي',
      evidence: 'والشحن للمعادي',
      review_state: 'needs_review',
    },
    fulfillment: {
      value: 'delivery',
      evidence: 'الشحن',
      review_state: 'from_source',
    },
    shippingFeeCents: {
      value: null,
      evidence: null,
      review_state: 'needs_review',
    },
    notes: {
      value: null,
      evidence: null,
      review_state: 'from_source',
    },
    discountCents: 0,
    items: [
      {
        id: 'item-demo-1',
        name: {
          value: 'تيشيرت أسود',
          evidence: 'عايزة تيشيرت أسود',
          review_state: 'from_source',
        },
        color: {
          value: 'أسود',
          evidence: 'أسود',
          review_state: 'from_source',
        },
        size: {
          value: 'M',
          evidence: 'مقاس M',
          review_state: 'from_source',
        },
        quantity: {
          value: 1,
          evidence: 'قطعة واحدة',
          review_state: 'from_source',
        },
        unit_price_cents: {
          value: null,
          evidence: null,
          review_state: 'missing',
        },
        catalog_product_id: 'prod-tshirt-1',
      },
    ],
    createdAt: now,
    updatedAt: now,
    isDraftSaved: false,
  };
}
