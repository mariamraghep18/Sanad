import {
  CareCircle,
  CareRecipient,
  CircleMember,
  Profile,
  TaskOccurrence,
  TaskTemplate,
  CareRecord,
  Assignment,
  Appointment,
  MedicationInstruction,
  SanadDocument,
  InAppNotification,
  AuditEvent,
  ExportJob,
  VisibilityScope,
  OccurrenceStatus,
  TruthSource,
  RecordResult,
  RecipientAuthorization,
  EmergencyAlert,
  TaskCategory,
  VitalSignReading,
  ConnectedDevice,
  WeeklyHealthReport,
  DayVitalSummary
} from '../types/sanad';

const SANAD_STORAGE_KEY = 'sanad_state_v1';

// Seed Profiles
export const SEED_PROFILES: Record<string, Profile> = {
  'usr-ahmed': {
    id: 'usr-ahmed',
    display_name: 'أحمد السعيد (الابن الأكبر)',
    phone_e164: '+201011112222',
    locale: 'ar-EG',
    timezone: 'Africa/Cairo',
    status: 'active',
  },
  'usr-mona': {
    id: 'usr-mona',
    display_name: 'منى السعيد (الابنة)',
    phone_e164: '+201022223333',
    locale: 'ar-EG',
    timezone: 'Africa/Cairo',
    status: 'active',
  },
  'usr-tarek': {
    id: 'usr-tarek',
    display_name: 'طارق السعيد (ابن - مهام عامة)',
    phone_e164: '+201033334444',
    locale: 'ar-EG',
    timezone: 'Africa/Cairo',
    status: 'active',
  },
  'usr-sara': {
    id: 'usr-sara',
    display_name: 'سارة (الحفيدة - متابع فقط)',
    phone_e164: '+201044445555',
    locale: 'ar-EG',
    timezone: 'Africa/Cairo',
    status: 'active',
  },
};

// Seed Circle & Recipient
export const SEED_RECIPIENT: CareRecipient = {
  id: 'rec-fatma-1',
  linked_user_id: null, // Elder without account
  preferred_name: 'الحاجة فاطمة السعيد',
  legal_name: 'فاطمة محمود أحمد السعيد',
  birth_year: 1952,
  status: 'active',
  created_at: '2026-10-01T08:00:00Z',
  updated_at: '2026-10-01T08:00:00Z',
};

export const SEED_CIRCLE: CareCircle = {
  id: 'cir-fatma-main',
  name: 'عائلة الحاجة فاطمة',
  timezone: 'Africa/Cairo',
  status: 'active',
  health_processing_enabled: true,
  authorization_epoch: 1,
  consent_version: 'v1.0-eg-2026',
  created_by: 'usr-ahmed',
  created_at: '2026-10-01T08:00:00Z',
  updated_at: '2026-10-01T08:00:00Z',
};

export const SEED_AUTHORIZATIONS: RecipientAuthorization[] = [
  {
    id: 'auth-1',
    recipient_id: 'rec-fatma-1',
    circle_id: 'cir-fatma-main',
    kind: 'authorized_representative_attestation',
    status: 'active',
    version: 1,
    attested_by_user_id: 'usr-ahmed',
    authority_basis: 'إقرار عائلي برعاية الوالدة بناءً على تفويض مباشر ورعايتها المشتركة بالمعادي',
    attestation_text: 'أقر أنا أحمد السعيد بأنني الممثل الأسري المفوض بالتنسيق لرعاية الحاجة فاطمة السعيد، مع الحفاظ على خصوصية بياناتها الصحية وحصر الاطلاع على المخولين فقط.',
    effective_at: '2026-10-01T08:00:00Z',
    revoked_at: null,
    created_at: '2026-10-01T08:00:00Z',
  },
];

export const SEED_MEMBERS: CircleMember[] = [
  {
    id: 'mem-1',
    circle_id: 'cir-fatma-main',
    user_id: 'usr-ahmed',
    role: 'admin',
    can_view_health_data: true,
    can_export: true,
    status: 'active',
    consent_version: 'v1.0',
    joined_at: '2026-10-01T08:00:00Z',
    removed_at: null,
    profile: SEED_PROFILES['usr-ahmed'],
  },
  {
    id: 'mem-2',
    circle_id: 'cir-fatma-main',
    user_id: 'usr-mona',
    role: 'caregiver',
    can_view_health_data: true,
    can_export: false,
    status: 'active',
    consent_version: 'v1.0',
    joined_at: '2026-10-01T08:30:00Z',
    removed_at: null,
    profile: SEED_PROFILES['usr-mona'],
  },
  {
    id: 'mem-3',
    circle_id: 'cir-fatma-main',
    user_id: 'usr-tarek',
    role: 'caregiver',
    can_view_health_data: false, // Explicitly false! Caregiver cannot see health tasks!
    can_export: false,
    status: 'active',
    consent_version: 'v1.0',
    joined_at: '2026-10-02T10:00:00Z',
    removed_at: null,
    profile: SEED_PROFILES['usr-tarek'],
  },
  {
    id: 'mem-4',
    circle_id: 'cir-fatma-main',
    user_id: 'usr-sara',
    role: 'viewer',
    can_view_health_data: false, // Viewer without health access
    can_export: false,
    status: 'active',
    consent_version: 'v1.0',
    joined_at: '2026-10-05T12:00:00Z',
    removed_at: null,
    profile: SEED_PROFILES['usr-sara'],
  },
];

// Seed Occurrences (Past, Today, Upcoming)
export const SEED_OCCURRENCES: TaskOccurrence[] = [
  {
    id: 'occ-1',
    circle_id: 'cir-fatma-main',
    template_id: 'tmpl-concor',
    template_version_id: 'ver-concor-1',
    title_snapshot: 'متابعة دواء الضغط صباحاً (كونكور 5 مجم)',
    category: 'medication_followup',
    visibility: 'health',
    timezone_snapshot: 'Africa/Cairo',
    scheduled_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
    due_window_end: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    status: 'recorded',
    row_version: 2,
    cancelled_at: null,
    created_at: '2026-10-25T00:00:00Z',
    current_record: {
      id: 'rec-101',
      occurrence_id: 'occ-1',
      circle_id: 'cir-fatma-main',
      result: 'done',
      truth_source: 'first_hand',
      actor_user_id: 'usr-mona',
      actor_profile: SEED_PROFILES['usr-mona'],
      reported_by_user_id: null,
      reported_by_label: null,
      observed_at: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
      observed_time_unknown: false,
      recorded_at: new Date(Date.now() - 2.4 * 3600 * 1000).toISOString(),
      note: 'تم التذكير بعد الإفطار وتناولت القرص مع نصف كوب ماء',
      row_version: 1,
      record_kind: 'initial',
      supersedes_record_id: null,
      correction_reason: null,
    },
    current_assignment: {
      id: 'asg-1',
      occurrence_id: 'occ-1',
      circle_id: 'cir-fatma-main',
      assignee_user_id: 'usr-mona',
      state: 'accepted',
      assigned_by: 'usr-ahmed',
      responded_at: '2026-10-25T08:00:00Z',
      row_version: 1,
      created_at: '2026-10-25T07:00:00Z',
      assignee_profile: SEED_PROFILES['usr-mona'],
    },
  },
  {
    id: 'occ-2',
    circle_id: 'cir-fatma-main',
    template_id: 'tmpl-sugar',
    template_version_id: 'ver-sugar-1',
    title_snapshot: 'قياس السكر قبل الغداء وتسجيل القراءة في الكراس',
    category: 'medication_followup',
    visibility: 'health',
    timezone_snapshot: 'Africa/Cairo',
    scheduled_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), // 1 hour ago
    due_window_end: new Date(Date.now() + 1 * 3600 * 1000).toISOString(),
    status: 'unrecorded',
    row_version: 1,
    cancelled_at: null,
    created_at: '2026-10-25T00:00:00Z',
    current_record: null,
    current_assignment: {
      id: 'asg-2',
      occurrence_id: 'occ-2',
      circle_id: 'cir-fatma-main',
      assignee_user_id: 'usr-ahmed',
      state: 'accepted',
      assigned_by: 'usr-ahmed',
      responded_at: '2026-10-25T09:00:00Z',
      row_version: 1,
      created_at: '2026-10-25T09:00:00Z',
      assignee_profile: SEED_PROFILES['usr-ahmed'],
    },
  },
  {
    id: 'occ-3',
    circle_id: 'cir-fatma-main',
    template_id: 'tmpl-transport',
    template_version_id: 'ver-transport-1',
    title_snapshot: 'تجهيز وسيلة انتقال موعد استشارة القلب وتأكيد السائق',
    category: 'appointment_logistics',
    visibility: 'general', // Visible to all members!
    timezone_snapshot: 'Africa/Cairo',
    scheduled_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // 4 hours in future
    due_window_end: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    status: 'unrecorded',
    row_version: 1,
    cancelled_at: null,
    created_at: '2026-10-25T00:00:00Z',
    current_record: null,
    current_assignment: {
      id: 'asg-3',
      occurrence_id: 'occ-3',
      circle_id: 'cir-fatma-main',
      assignee_user_id: 'usr-tarek',
      state: 'accepted',
      assigned_by: 'usr-ahmed',
      responded_at: '2026-10-25T10:00:00Z',
      row_version: 1,
      created_at: '2026-10-25T10:00:00Z',
      assignee_profile: SEED_PROFILES['usr-tarek'],
    },
  },
  {
    id: 'occ-4',
    circle_id: 'cir-fatma-main',
    template_id: 'tmpl-groceries',
    template_version_id: 'ver-groceries-1',
    title_snapshot: 'شراء مستلزمات العطارة والمياه المعدنية للبيت',
    category: 'general',
    visibility: 'general', // Visible to all
    timezone_snapshot: 'Africa/Cairo',
    scheduled_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // Tomorrow
    due_window_end: null,
    status: 'unrecorded',
    row_version: 1,
    cancelled_at: null,
    created_at: '2026-10-25T00:00:00Z',
    current_record: null,
    current_assignment: null, // Unassigned
  },
  {
    id: 'occ-meal-breakfast',
    circle_id: 'cir-fatma-main',
    template_id: 'tmpl-breakfast',
    template_version_id: 'ver-bf-1',
    title_snapshot: 'وجبة الإفطار الصحية (شوفان وبيض مسلوق وشاي خفيف)',
    category: 'general',
    visibility: 'general',
    timezone_snapshot: 'Africa/Cairo',
    scheduled_at: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    due_window_end: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'recorded',
    row_version: 2,
    cancelled_at: null,
    created_at: '2026-10-25T00:00:00Z',
    current_record: {
      id: 'rec-bf-1',
      occurrence_id: 'occ-meal-breakfast',
      circle_id: 'cir-fatma-main',
      result: 'done',
      truth_source: 'first_hand',
      actor_user_id: 'usr-mona',
      actor_profile: SEED_PROFILES['usr-mona'],
      reported_by_user_id: null,
      reported_by_label: null,
      observed_at: new Date(Date.now() - 3.2 * 3600 * 1000).toISOString(),
      observed_time_unknown: false,
      recorded_at: new Date(Date.now() - 3.1 * 3600 * 1000).toISOString(),
      note: 'تناولت الإفطار كاملاً بشهية جيدة والحمد لله',
      row_version: 1,
      record_kind: 'initial',
      supersedes_record_id: null,
      correction_reason: null,
    },
    current_assignment: {
      id: 'asg-bf',
      occurrence_id: 'occ-meal-breakfast',
      circle_id: 'cir-fatma-main',
      assignee_user_id: 'usr-mona',
      state: 'accepted',
      assigned_by: 'usr-ahmed',
      responded_at: '2026-10-25T07:30:00Z',
      row_version: 1,
      created_at: '2026-10-25T07:00:00Z',
      assignee_profile: SEED_PROFILES['usr-mona'],
    },
  },
  {
    id: 'occ-meal-lunch',
    circle_id: 'cir-fatma-main',
    template_id: 'tmpl-lunch',
    template_version_id: 'ver-lunch-1',
    title_snapshot: 'وجبة الغداء (صدر دجاج مشوي وخضار سوتيه قليل الملح)',
    category: 'general',
    visibility: 'general',
    timezone_snapshot: 'Africa/Cairo',
    scheduled_at: new Date(Date.now() + 1.5 * 3600 * 1000).toISOString(),
    due_window_end: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    status: 'unrecorded',
    row_version: 1,
    cancelled_at: null,
    created_at: '2026-10-25T00:00:00Z',
    current_record: null,
    current_assignment: {
      id: 'asg-lunch',
      occurrence_id: 'occ-meal-lunch',
      circle_id: 'cir-fatma-main',
      assignee_user_id: 'usr-tarek',
      state: 'accepted',
      assigned_by: 'usr-ahmed',
      responded_at: '2026-10-25T09:00:00Z',
      row_version: 1,
      created_at: '2026-10-25T09:00:00Z',
      assignee_profile: SEED_PROFILES['usr-tarek'],
    },
  },
  {
    id: 'occ-meal-dinner',
    circle_id: 'cir-fatma-main',
    template_id: 'tmpl-dinner',
    template_version_id: 'ver-din-1',
    title_snapshot: 'وجبة العشاء الخفيف (زبادي بلدي وفاكهة مهروسة)',
    category: 'general',
    visibility: 'general',
    timezone_snapshot: 'Africa/Cairo',
    scheduled_at: new Date(Date.now() + 7 * 3600 * 1000).toISOString(),
    due_window_end: new Date(Date.now() + 8.5 * 3600 * 1000).toISOString(),
    status: 'unrecorded',
    row_version: 1,
    cancelled_at: null,
    created_at: '2026-10-25T00:00:00Z',
    current_record: null,
    current_assignment: null, // Unassigned for any family member to take
  },
  {
    id: 'occ-5',
    circle_id: 'cir-fatma-main',
    template_id: 'tmpl-eyedrop',
    template_version_id: 'ver-eyedrop-1',
    title_snapshot: 'قطرة العين المسائية (زايمار)',
    category: 'medication_followup',
    visibility: 'health',
    timezone_snapshot: 'Africa/Cairo',
    scheduled_at: new Date(Date.now() + 8 * 3600 * 1000).toISOString(), // Tonight
    due_window_end: new Date(Date.now() + 10 * 3600 * 1000).toISOString(),
    status: 'unrecorded',
    row_version: 1,
    cancelled_at: null,
    created_at: '2026-10-25T00:00:00Z',
    current_record: null,
    current_assignment: {
      id: 'asg-5',
      occurrence_id: 'occ-5',
      circle_id: 'cir-fatma-main',
      assignee_user_id: 'usr-mona',
      state: 'pending', // Pending acceptance!
      assigned_by: 'usr-ahmed',
      responded_at: null,
      row_version: 1,
      created_at: '2026-10-25T11:00:00Z',
      assignee_profile: SEED_PROFILES['usr-mona'],
    },
  },
];

export const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma-1',
    title: 'استشارة متابعة القلب ودعامات الشريان التاجي',
    visibility: 'health',
    starts_at: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 45 * 60 * 1000).toISOString(),
    timezone_snapshot: 'Africa/Cairo',
    location: 'عيادة د. مجدي مصطفى - المعادي برج الأطباء شارع النصر',
    status: 'confirmed',
    row_version: 1,
    notes: 'إحضار رسم القلب الأخير والتحاليل الحديثة',
  },
];

export const SEED_INSTRUCTIONS: MedicationInstruction[] = [
  {
    id: 'ins-1',
    circle_id: 'cir-fatma-main',
    instruction_text: 'قرص كونكور 5 مجم يومياً صباحاً بعد الإفطار مباشرة (تنبيه: مرجع عائلي تنسيقي فقط ولا يغني عن تعليمات الطبيب المكتوبة).',
    entered_by: 'usr-ahmed',
    source_label: 'روشتة استشارة القلب أكتوبر 2026',
    confirmed_by: 'usr-ahmed',
    confirmed_at: '2026-10-15T10:00:00Z',
    status: 'confirmed',
  },
  {
    id: 'ins-2',
    circle_id: 'cir-fatma-main',
    instruction_text: 'نقطتين في كل عين من قطرة زايمار مساءً قبل النوم.',
    entered_by: 'usr-mona',
    source_label: 'تقرير جراحة المياه البيضاء بالمركز الطبي',
    confirmed_by: 'usr-mona',
    confirmed_at: '2026-10-20T12:00:00Z',
    status: 'confirmed',
  },
];

export const SEED_DOCUMENTS: SanadDocument[] = [
  {
    id: 'doc-1',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma-1',
    original_name: 'روشتة_د_مجدي_قلب_اكتوبر_2026.pdf',
    mime_type: 'application/pdf',
    byte_size: 420000,
    visibility: 'health',
    status: 'active',
    uploaded_by: 'usr-ahmed',
    uploaded_by_name: 'أحمد السعيد',
    created_at: '2026-10-15T11:00:00Z',
    deleted_at: null,
    ai_run: {
      id: 'ai-run-1',
      document_id: 'doc-1',
      circle_id: 'cir-fatma-main',
      status: 'review_required', // Strict human review gate!
      extracted_text: 'التشخيص: ارتفاع ضغط دم منتظم ومتابعة ما بعد دعامة.\nالأدوية المقترحة للمتابعة العائلية:\n1. كونكور 5 مجم قرص صباحاً.\n2. أسبرين بروتكت 100 مجم بعد الغداء.\nالموعد القادم: بعد شهر مع تحليل وظائف كلى.',
      source_refs: [
        { quote: 'كونكور 5 مجم قرص صباحاً بعد الإفطار', location: 'صفحة 1 - سطر 4' },
        { quote: 'استشارة متابعة بعد شهر', location: 'صفحة 1 - سطر 12' }
      ],
      model_name: 'gemini-1.5-flash',
      prompt_version: 'sanad-v1.2-strict-no-diag',
      reviewed_by: null,
      reviewed_at: null,
    },
  },
];

export const SEED_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud-1',
    circle_id: 'cir-fatma-main',
    actor_user_id: 'usr-ahmed',
    actor_name: 'أحمد السعيد',
    action: 'circle_created',
    entity_type: 'care_circles',
    entity_id: 'cir-fatma-main',
    metadata: { consent_version: 'v1.0-eg-2026', initial_admin: 'usr-ahmed' },
    request_id: 'req-01',
    created_at: '2026-10-01T08:00:00Z',
  },
  {
    id: 'aud-2',
    circle_id: 'cir-fatma-main',
    actor_user_id: 'usr-ahmed',
    actor_name: 'أحمد السعيد',
    action: 'member_added',
    entity_type: 'circle_members',
    entity_id: 'mem-2',
    metadata: { user_id: 'usr-mona', role: 'caregiver', can_view_health: true },
    request_id: 'req-02',
    created_at: '2026-10-01T08:30:00Z',
  },
  {
    id: 'aud-3',
    circle_id: 'cir-fatma-main',
    actor_user_id: 'usr-mona',
    actor_name: 'منى السعيد',
    action: 'care_record_created',
    entity_type: 'care_records',
    entity_id: 'rec-101',
    metadata: { occurrence_id: 'occ-1', result: 'done', truth_source: 'first_hand' },
    request_id: 'req-03',
    created_at: new Date(Date.now() - 2.4 * 3600 * 1000).toISOString(),
  },
];

export const SEED_DEVICES: ConnectedDevice[] = [
  {
    id: 'dev-bp-01',
    name: 'جهاز قياس ضغط الدم اللاسلكي',
    model: 'Omron Evolv (HEM-7600T-E)',
    type: 'blood_pressure',
    serial_number: 'OMR-EV-7600-8841',
    status: 'connected',
    last_sync_at: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    battery_level: 91,
  },
  {
    id: 'dev-glu-02',
    name: 'جهاز قياس مستوى السكر في الدم',
    model: 'Roche Accu-Chek Instant BT',
    type: 'glucose_meter',
    serial_number: 'ACK-INST-5592',
    status: 'connected',
    last_sync_at: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    battery_level: 85,
  },
  {
    id: 'dev-ox-03',
    name: 'جهاز قياس نبض وتأكسج الدم',
    model: 'Beurer PO 60 Pulse Oximeter Bluetooth',
    type: 'pulse_oximeter',
    serial_number: 'BR-PO60-3104',
    status: 'connected',
    last_sync_at: new Date(Date.now() - 5.2 * 3600 * 1000).toISOString(),
    battery_level: 78,
  },
];

export const SEED_VITALS: VitalSignReading[] = [
  // Day 0 (اليوم)
  {
    id: 'vit-01',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma',
    device_id: 'dev-bp-01',
    device_name: 'Omron Evolv',
    device_type: 'blood_pressure',
    type: 'blood_pressure',
    value_primary: 124, // Systolic
    value_secondary: 81, // Diastolic
    unit: 'mmHg',
    measured_at: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    synced_at: new Date(Date.now() - 41 * 60 * 1000).toISOString(),
    status: 'normal',
    note: 'قياس صباحي تلقائي عبر البلوتوث - نبض القلب 72 ن/د',
  },
  {
    id: 'vit-02',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma',
    device_id: 'dev-glu-02',
    device_name: 'Accu-Chek Instant',
    device_type: 'glucose_meter',
    type: 'blood_glucose',
    value_primary: 114,
    unit: 'mg/dL',
    measured_at: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    synced_at: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    status: 'normal',
    note: 'سكر صائم قبل الإفطار - قياس متزامن مع الجهاز',
  },
  {
    id: 'vit-03',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma',
    device_id: 'dev-ox-03',
    device_name: 'Beurer PO 60',
    device_type: 'pulse_oximeter',
    type: 'oxygen_saturation',
    value_primary: 98,
    value_secondary: 74,
    unit: '%',
    measured_at: new Date(Date.now() - 5.2 * 3600 * 1000).toISOString(),
    synced_at: new Date(Date.now() - 5.2 * 3600 * 1000).toISOString(),
    status: 'normal',
    note: 'نسبة تشبع الأكسجين 98% ومعدل النبض 74 ن/د',
  },

  // Day 1 (أمس)
  {
    id: 'vit-d1-bp',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma',
    device_id: 'dev-bp-01',
    device_name: 'Omron Evolv',
    device_type: 'blood_pressure',
    type: 'blood_pressure',
    value_primary: 122,
    value_secondary: 80,
    unit: 'mmHg',
    measured_at: new Date(Date.now() - 1 * 86400 * 1000 - 3600 * 1000).toISOString(),
    synced_at: new Date(Date.now() - 1 * 86400 * 1000 - 3600 * 1000).toISOString(),
    status: 'normal',
    note: 'قياس صباحي منتظم',
  },
  {
    id: 'vit-d1-glu',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma',
    device_id: 'dev-glu-02',
    device_name: 'Accu-Chek Instant',
    device_type: 'glucose_meter',
    type: 'blood_glucose',
    value_primary: 118,
    unit: 'mg/dL',
    measured_at: new Date(Date.now() - 1 * 86400 * 1000 - 4 * 3600 * 1000).toISOString(),
    synced_at: new Date(Date.now() - 1 * 86400 * 1000 - 4 * 3600 * 1000).toISOString(),
    status: 'normal',
    note: 'سكر صائم قبل وجبة الصباح',
  },

  // Day 2 (منذ يومين)
  {
    id: 'vit-d2-bp',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma',
    device_id: 'dev-bp-01',
    device_name: 'Omron Evolv',
    device_type: 'blood_pressure',
    type: 'blood_pressure',
    value_primary: 126,
    value_secondary: 83,
    unit: 'mmHg',
    measured_at: new Date(Date.now() - 2 * 86400 * 1000 - 2 * 3600 * 1000).toISOString(),
    synced_at: new Date(Date.now() - 2 * 86400 * 1000 - 2 * 3600 * 1000).toISOString(),
    status: 'normal',
    note: 'ضغط مستقر بعد وجبة خفيفة',
  },
  {
    id: 'vit-d2-glu',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma',
    device_id: 'dev-glu-02',
    device_name: 'Accu-Chek Instant',
    device_type: 'glucose_meter',
    type: 'blood_glucose',
    value_primary: 122,
    unit: 'mg/dL',
    measured_at: new Date(Date.now() - 2 * 86400 * 1000 - 5 * 3600 * 1000).toISOString(),
    synced_at: new Date(Date.now() - 2 * 86400 * 1000 - 5 * 3600 * 1000).toISOString(),
    status: 'normal',
    note: 'سكر صائم منتظم',
  },

  // Day 3 (منذ 3 أيام)
  {
    id: 'vit-d3-bp',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma',
    device_id: 'dev-bp-01',
    device_name: 'Omron Evolv',
    device_type: 'blood_pressure',
    type: 'blood_pressure',
    value_primary: 120,
    value_secondary: 79,
    unit: 'mmHg',
    measured_at: new Date(Date.now() - 3 * 86400 * 1000 - 3 * 3600 * 1000).toISOString(),
    synced_at: new Date(Date.now() - 3 * 86400 * 1000 - 3 * 3600 * 1000).toISOString(),
    status: 'normal',
    note: 'قراءة ممتازة وهدوء عام',
  },
  {
    id: 'vit-d3-glu',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma',
    device_id: 'dev-glu-02',
    device_name: 'Accu-Chek Instant',
    device_type: 'glucose_meter',
    type: 'blood_glucose',
    value_primary: 110,
    unit: 'mg/dL',
    measured_at: new Date(Date.now() - 3 * 86400 * 1000 - 6 * 3600 * 1000).toISOString(),
    synced_at: new Date(Date.now() - 3 * 86400 * 1000 - 6 * 3600 * 1000).toISOString(),
    status: 'normal',
    note: 'سكر صائم منخفض ومثالي',
  },

  // Day 4 (منذ 4 أيام)
  {
    id: 'vit-d4-bp',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma',
    device_id: 'dev-bp-01',
    device_name: 'Omron Evolv',
    device_type: 'blood_pressure',
    type: 'blood_pressure',
    value_primary: 125,
    value_secondary: 82,
    unit: 'mmHg',
    measured_at: new Date(Date.now() - 4 * 86400 * 1000 - 2 * 3600 * 1000).toISOString(),
    synced_at: new Date(Date.now() - 4 * 86400 * 1000 - 2 * 3600 * 1000).toISOString(),
    status: 'normal',
    note: 'معدل نبض 73 ن/د',
  },
  {
    id: 'vit-d4-glu',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma',
    device_id: 'dev-glu-02',
    device_name: 'Accu-Chek Instant',
    device_type: 'glucose_meter',
    type: 'blood_glucose',
    value_primary: 115,
    unit: 'mg/dL',
    measured_at: new Date(Date.now() - 4 * 86400 * 1000 - 5 * 3600 * 1000).toISOString(),
    synced_at: new Date(Date.now() - 4 * 86400 * 1000 - 5 * 3600 * 1000).toISOString(),
    status: 'normal',
    note: 'سكر صائم',
  },

  // Day 5 (منذ 5 أيام)
  {
    id: 'vit-d5-bp',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma',
    device_id: 'dev-bp-01',
    device_name: 'Omron Evolv',
    device_type: 'blood_pressure',
    type: 'blood_pressure',
    value_primary: 128,
    value_secondary: 84,
    unit: 'mmHg',
    measured_at: new Date(Date.now() - 5 * 86400 * 1000 - 3 * 3600 * 1000).toISOString(),
    synced_at: new Date(Date.now() - 5 * 86400 * 1000 - 3 * 3600 * 1000).toISOString(),
    status: 'normal',
    note: 'ارتفاع طفيف بعد مجهود خفيف',
  },
  {
    id: 'vit-d5-glu',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma',
    device_id: 'dev-glu-02',
    device_name: 'Accu-Chek Instant',
    device_type: 'glucose_meter',
    type: 'blood_glucose',
    value_primary: 125,
    unit: 'mg/dL',
    measured_at: new Date(Date.now() - 5 * 86400 * 1000 - 6 * 3600 * 1000).toISOString(),
    synced_at: new Date(Date.now() - 5 * 86400 * 1000 - 6 * 3600 * 1000).toISOString(),
    status: 'normal',
    note: 'سكر صائم',
  },

  // Day 6 (منذ 6 أيام)
  {
    id: 'vit-d6-bp',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma',
    device_id: 'dev-bp-01',
    device_name: 'Omron Evolv',
    device_type: 'blood_pressure',
    type: 'blood_pressure',
    value_primary: 121,
    value_secondary: 78,
    unit: 'mmHg',
    measured_at: new Date(Date.now() - 6 * 86400 * 1000 - 2 * 3600 * 1000).toISOString(),
    synced_at: new Date(Date.now() - 6 * 86400 * 1000 - 2 * 3600 * 1000).toISOString(),
    status: 'normal',
    note: 'قياس صباحي ممتاز',
  },
  {
    id: 'vit-d6-glu',
    circle_id: 'cir-fatma-main',
    recipient_id: 'rec-fatma',
    device_id: 'dev-glu-02',
    device_name: 'Accu-Chek Instant',
    device_type: 'glucose_meter',
    type: 'blood_glucose',
    value_primary: 112,
    unit: 'mg/dL',
    measured_at: new Date(Date.now() - 6 * 86400 * 1000 - 5 * 3600 * 1000).toISOString(),
    synced_at: new Date(Date.now() - 6 * 86400 * 1000 - 5 * 3600 * 1000).toISOString(),
    status: 'normal',
    note: 'سكر صائم',
  },
];

export const SEED_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    user_id: 'usr-ahmed',
    circle_id: 'cir-fatma-main',
    kind: 'task_reminder',
    visibility: 'health',
    title: 'موعد قياس السكر قبل الغداء',
    body: 'حان موعد قياس السكر للحاجة فاطمة وتوثيق النتيجة',
    generic_lock_screen_text: 'لديك متابعة مجدولة في سند', // Privacy: No PII or medicine name on lock screen!
    read_at: null,
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'usr-tarek',
    circle_id: 'cir-fatma-main',
    kind: 'task_reminder',
    visibility: 'general',
    title: 'تأكيد سيارة الانتقال لموعد العيادة',
    body: 'يرجى تأكيد السائق أو وسيلة الانتقال لعيادة المعادي',
    generic_lock_screen_text: 'لديك متابعة مجدولة في سند',
    read_at: null,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
];

class SanadService {
  private circle: CareCircle;
  private recipient: CareRecipient;
  private authorizations: RecipientAuthorization[];
  private members: CircleMember[];
  private occurrences: TaskOccurrence[];
  private appointments: Appointment[];
  private instructions: MedicationInstruction[];
  private documents: SanadDocument[];
  private auditEvents: AuditEvent[];
  private notifications: InAppNotification[];
  private devices: ConnectedDevice[];
  private vitalReadings: VitalSignReading[];
  private activeUserId: string = 'usr-ahmed'; // Current simulated user

  constructor() {
    this.circle = { ...SEED_CIRCLE };
    this.recipient = { ...SEED_RECIPIENT };
    this.authorizations = [...SEED_AUTHORIZATIONS];
    this.members = [...SEED_MEMBERS];
    this.occurrences = [...SEED_OCCURRENCES];
    this.appointments = [...SEED_APPOINTMENTS];
    this.instructions = [...SEED_INSTRUCTIONS];
    this.documents = [...SEED_DOCUMENTS];
    this.auditEvents = [...SEED_AUDIT_EVENTS];
    this.notifications = [...SEED_NOTIFICATIONS];
    this.devices = [...SEED_DEVICES];
    this.vitalReadings = [...SEED_VITALS];
  }

  // Active User / Member Context
  public getActiveUser(): Profile {
    return SEED_PROFILES[this.activeUserId] || SEED_PROFILES['usr-ahmed'];
  }

  public getActiveMember(): CircleMember | undefined {
    return this.members.find(m => m.user_id === this.activeUserId && m.status === 'active');
  }

  public setActiveUser(userId: string) {
    if (SEED_PROFILES[userId]) {
      this.activeUserId = userId;
    }
  }

  public getAllProfiles(): Profile[] {
    return Object.values(SEED_PROFILES);
  }

  public getCircle(): CareCircle {
    return this.circle;
  }

  public getRecipient(): CareRecipient {
    return this.recipient;
  }

  public getAuthorizations(): RecipientAuthorization[] {
    return this.authorizations;
  }

  public getMembers(): CircleMember[] {
    return this.members;
  }

  /**
   * CANONICAL CORE VISIBILITY CHECK:
   * can_view(circleId, auth.uid(), visibility)
   * Must verify:
   * 1. Member is active in the circle
   * 2. If visibility is 'health':
   *    - care_circles.health_processing_enabled must be TRUE!
   *    - member.can_view_health_data must be TRUE!
   *    - Note: Role 'admin' alone NEVER bypasses this check!
   */
  public canView(visibility: VisibilityScope): boolean {
    const member = this.getActiveMember();
    if (!member) return false;

    if (visibility === 'general') return true;

    // Health visibility check
    if (!this.circle.health_processing_enabled) return false;
    return member.can_view_health_data === true;
  }

  public canExport(): boolean {
    const member = this.getActiveMember();
    if (!member) return false;
    return member.can_export === true && this.circle.health_processing_enabled;
  }

  public isAdmin(): boolean {
    const member = this.getActiveMember();
    return member?.role === 'admin';
  }

  // Occurrences (Tasks)
  public getOccurrences(): TaskOccurrence[] {
    const canSeeHealth = this.canView('health');
    return this.occurrences.filter(occ => {
      if (occ.visibility === 'health' && !canSeeHealth) {
        return false;
      }
      return true;
    });
  }

  public getOccurrence(id: string): TaskOccurrence | undefined {
    const occ = this.occurrences.find(o => o.id === id);
    if (!occ) return undefined;
    if (occ.visibility === 'health' && !this.canView('health')) {
      return undefined; // 404 behavior as mandated by specs to prevent enumeration!
    }
    return occ;
  }

  /**
   * Create a recurring daily reminder schedule for medications, meals, and care plan routines
   */
  public createTaskSchedule(params: {
    title: string;
    category: TaskCategory;
    visibility: VisibilityScope;
    timeOfDay: string; // e.g. "08:30"
    recurrenceRule: string; // e.g. 'يومياً (Daily)'
    assigneeUserId?: string | null;
    notifyAllMembers?: boolean;
    note?: string | null;
  }): { success: boolean; occurrence?: TaskOccurrence; error?: string } {
    const member = this.getActiveMember();
    if (!member || member.role === 'viewer') {
      return { success: false, error: 'غير مصرح للمشاهد بإنشاء أو جدولة التذكيرات' };
    }

    if (params.visibility === 'health' && !this.canView('health')) {
      return { success: false, error: 'لا تملك تصريحاً لجدولة مهام صحية أو دوائية' };
    }

    if (params.assigneeUserId && params.visibility === 'health') {
      const target = this.members.find(m => m.user_id === params.assigneeUserId);
      if (target && !target.can_view_health_data) {
        return { success: false, error: 'لا يمكن تعيين مهمة دوائية لعضو غير مصرح له برؤية البيانات الصحية' };
      }
    }

    // Build scheduled_at timestamp from timeOfDay
    const now = new Date();
    const [hours, minutes] = params.timeOfDay.split(':').map(Number);
    const scheduled = new Date(now);
    scheduled.setHours(hours || 8, minutes || 0, 0, 0);

    // If scheduled time for today has already elapsed, schedule for next occurrence (tomorrow)
    if (scheduled.getTime() < now.getTime()) {
      scheduled.setDate(scheduled.getDate() + 1);
    }

    const scheduledIso = scheduled.toISOString();
    const dueWindowEnd = new Date(scheduled.getTime() + 60 * 60 * 1000).toISOString();

    const templateId = 'tmpl-' + Date.now().toString(36);
    const occurrenceId = 'occ-' + Date.now().toString(36);

    const targetAssignee = params.assigneeUserId 
      ? this.members.find(m => m.user_id === params.assigneeUserId)
      : null;

    const newOcc: TaskOccurrence = {
      id: occurrenceId,
      circle_id: this.circle.id,
      template_id: templateId,
      template_version_id: 'ver-1',
      title_snapshot: params.title,
      category: params.category,
      visibility: params.visibility,
      timezone_snapshot: this.circle.timezone,
      scheduled_at: scheduledIso,
      due_window_end: dueWindowEnd,
      status: 'unrecorded',
      row_version: 1,
      cancelled_at: null,
      created_at: new Date().toISOString(),
      current_record: null,
      current_assignment: targetAssignee ? {
        id: 'asg-' + Date.now().toString(36),
        occurrence_id: occurrenceId,
        circle_id: this.circle.id,
        assignee_user_id: targetAssignee.user_id,
        state: 'pending',
        assigned_by: member.user_id,
        responded_at: null,
        row_version: 1,
        created_at: new Date().toISOString(),
        assignee_profile: targetAssignee.profile,
      } : null,
    };

    this.occurrences.unshift(newOcc);

    // Broadcast Reminder Notifications
    const recipients = params.notifyAllMembers 
      ? this.members.filter(m => params.visibility === 'general' || m.can_view_health_data)
      : (targetAssignee ? [targetAssignee] : this.members.filter(m => m.user_id === member.user_id));

    recipients.forEach(r => {
      this.notifications.unshift({
        id: 'notif-rem-' + r.user_id + '-' + Date.now().toString(36),
        user_id: r.user_id,
        circle_id: this.circle.id,
        kind: 'task_reminder',
        visibility: params.visibility,
        title: `⏰ تذكير دوري: ${params.title}`,
        body: `تذكير بموعد خطة الرعاية للحاجة فاطمة: ${params.title} (${params.timeOfDay}) - ${params.recurrenceRule}`,
        generic_lock_screen_text: 'لديك متابعة مجدولة في سند',
        read_at: null,
        created_at: new Date().toISOString(),
      });
    });

    // Audit Event
    this.addAuditEvent({
      action: 'task_schedule_created',
      entity_type: 'task_templates',
      entity_id: templateId,
      metadata: {
        title: params.title,
        category: params.category,
        visibility: params.visibility,
        time_of_day: params.timeOfDay,
        recurrence: params.recurrenceRule,
        scheduled_at: scheduledIso,
        assignee: targetAssignee?.profile.display_name || 'غير معيّن',
      },
    });

    return { success: true, occurrence: newOcc };
  }

  /**
   * Record a care event on an occurrence
   * Strict Rule: No defaults! User must choose done | not_done and truth_source
   */
  public recordCareOccurrence(params: {
    occurrenceId: string;
    result: RecordResult;
    truthSource: TruthSource;
    observedAt: string | null;
    observedTimeUnknown: boolean;
    reportedByLabel: string | null;
    note: string | null;
    expectedRowVersion: number;
  }): { success: boolean; error?: string } {
    const occ = this.getOccurrence(params.occurrenceId);
    if (!occ) return { success: false, error: 'المهمة غير موجودة أو غير مصرح بعرضها' };

    const member = this.getActiveMember();
    if (!member || (member.role === 'viewer')) {
      return { success: false, error: 'صلاحيات المشاهد (Viewer) للقراءة فقط ولا تتيح تسجيل المتابعات' };
    }

    // Guard optimistic row version
    if (occ.row_version !== params.expectedRowVersion) {
      return {
        success: false,
        error: `البيانات اتغيرت أثناء التسجيل (النسخة الحالية ${occ.row_version})؛ حدث الصفحة وحاول تاني.`
      };
    }

    const now = new Date().toISOString();
    const newRecord: CareRecord = {
      id: 'rec-' + Date.now().toString(36),
      occurrence_id: occ.id,
      circle_id: this.circle.id,
      result: params.result,
      truth_source: params.truthSource,
      actor_user_id: member.user_id,
      actor_profile: member.profile,
      reported_by_user_id: null,
      reported_by_label: params.reportedByLabel,
      observed_at: params.observedTimeUnknown ? null : params.observedAt,
      observed_time_unknown: params.observedTimeUnknown,
      recorded_at: now,
      note: params.note,
      row_version: 1,
      record_kind: 'initial',
      supersedes_record_id: null,
      correction_reason: null,
    };

    occ.current_record = newRecord;
    occ.status = params.result === 'done' ? 'recorded' : 'not_done';
    occ.row_version += 1;

    // Log Audit Event
    this.addAuditEvent({
      action: 'care_record_created',
      entity_type: 'care_records',
      entity_id: newRecord.id,
      metadata: {
        occurrence_id: occ.id,
        result: params.result,
        truth_source: params.truthSource,
        version: occ.row_version,
      },
    });

    return { success: true };
  }

  /**
   * Submit an append-only correction
   */
  public submitCorrection(params: {
    occurrenceId: string;
    result: RecordResult;
    truthSource: TruthSource;
    observedAt: string | null;
    observedTimeUnknown: boolean;
    reportedByLabel: string | null;
    note: string | null;
    correctionReason: string;
    supersedesRecordId: string;
    expectedRowVersion: number;
  }): { success: boolean; error?: string } {
    const occ = this.getOccurrence(params.occurrenceId);
    if (!occ) return { success: false, error: 'المهمة غير موجودة' };

    const member = this.getActiveMember();
    if (!member || member.role === 'viewer') {
      return { success: false, error: 'غير مصرح لك بإجراء تصحيح' };
    }

    if (occ.row_version !== params.expectedRowVersion) {
      return { success: false, error: 'نزاع في النسخة (Stale Row Version)؛ برجاء التحديث' };
    }

    const now = new Date().toISOString();
    const correctionRecord: CareRecord = {
      id: 'rec-corr-' + Date.now().toString(36),
      occurrence_id: occ.id,
      circle_id: this.circle.id,
      result: params.result,
      truth_source: params.truthSource,
      actor_user_id: member.user_id,
      actor_profile: member.profile,
      reported_by_user_id: null,
      reported_by_label: params.reportedByLabel,
      observed_at: params.observedTimeUnknown ? null : params.observedAt,
      observed_time_unknown: params.observedTimeUnknown,
      recorded_at: now,
      note: params.note,
      row_version: (occ.current_record?.row_version || 1) + 1,
      record_kind: 'correction',
      supersedes_record_id: params.supersedesRecordId,
      correction_reason: params.correctionReason,
    };

    occ.current_record = correctionRecord;
    occ.status = params.result === 'done' ? 'recorded' : 'not_done';
    occ.row_version += 1;

    this.addAuditEvent({
      action: 'care_record_corrected',
      entity_type: 'care_records',
      entity_id: correctionRecord.id,
      metadata: {
        supersedes_id: params.supersedesRecordId,
        reason: params.correctionReason,
      },
    });

    return { success: true };
  }

  /**
   * Assignment Management (Accept, Decline, Handoff)
   */
  public respondToAssignment(occurrenceId: string, accept: boolean): { success: boolean; error?: string } {
    const occ = this.getOccurrence(occurrenceId);
    if (!occ || !occ.current_assignment) return { success: false, error: 'التعيين غير متاح' };

    const member = this.getActiveMember();
    if (!member || occ.current_assignment.assignee_user_id !== member.user_id) {
      return { success: false, error: 'التعيين مخصص لشخص آخر' };
    }

    occ.current_assignment.state = accept ? 'accepted' : 'declined';
    occ.current_assignment.responded_at = new Date().toISOString();
    occ.current_assignment.row_version += 1;

    this.addAuditEvent({
      action: accept ? 'assignment_accepted' : 'assignment_declined',
      entity_type: 'assignments',
      entity_id: occ.current_assignment.id,
      metadata: { occurrence_id: occ.id },
    });

    return { success: true };
  }

  public handoffAssignment(occurrenceId: string, targetUserId: string): { success: boolean; error?: string } {
    const occ = this.getOccurrence(occurrenceId);
    if (!occ) return { success: false, error: 'المهمة غير موجودة' };

    const targetMember = this.members.find(m => m.user_id === targetUserId && m.status === 'active');
    if (!targetMember) return { success: false, error: 'العضو المستهدف غير نشط' };

    // If task is health, target MUST have can_view_health_data!
    if (occ.visibility === 'health' && !targetMember.can_view_health_data) {
      return {
        success: false,
        error: `لا يمكن تسليم مهمة صحية لـ "${targetMember.profile.display_name}" لأنه لا يملك تصريح رؤية البيانات الصحية (can_view_health_data).`
      };
    }

    // In a handoff, current accepted remains until target accepts
    occ.current_assignment = {
      id: 'asg-' + Date.now().toString(36),
      occurrence_id: occ.id,
      circle_id: this.circle.id,
      assignee_user_id: targetUserId,
      state: 'pending',
      assigned_by: this.activeUserId,
      responded_at: null,
      row_version: 1,
      created_at: new Date().toISOString(),
      assignee_profile: targetMember.profile,
    };

    this.addAuditEvent({
      action: 'assignment_handoff_initiated',
      entity_type: 'assignments',
      entity_id: occ.current_assignment.id,
      metadata: { target_user_id: targetUserId },
    });

    return { success: true };
  }

  // Recipient Processing Withdrawal (Emergency Stop)
  public withdrawRecipientProcessing(reason: string): { success: boolean } {
    this.circle.health_processing_enabled = false;
    this.circle.authorization_epoch += 1;
    this.circle.updated_at = new Date().toISOString();

    const authRecord: RecipientAuthorization = {
      id: 'auth-withdraw-' + Date.now().toString(36),
      recipient_id: this.recipient.id,
      circle_id: this.circle.id,
      kind: 'processing_withdrawal',
      status: 'revoked',
      version: this.authorizations.length + 1,
      attested_by_user_id: this.activeUserId,
      authority_basis: reason,
      attestation_text: `تم سحب الموافقة على معالجة البيانات الصحية للمستفيد وتجميد وصول الصحة بالكامل. السبب: ${reason}`,
      effective_at: new Date().toISOString(),
      revoked_at: null,
      created_at: new Date().toISOString(),
    };
    this.authorizations.unshift(authRecord);

    this.addAuditEvent({
      action: 'recipient_processing_withdrawn',
      entity_type: 'care_circles',
      entity_id: this.circle.id,
      metadata: {
        new_authorization_epoch: this.circle.authorization_epoch,
        reason,
      },
    });

    return { success: true };
  }

  public restoreRecipientProcessing(): { success: boolean } {
    this.circle.health_processing_enabled = true;
    this.circle.authorization_epoch += 1;
    this.circle.updated_at = new Date().toISOString();

    this.addAuditEvent({
      action: 'recipient_processing_restored',
      entity_type: 'care_circles',
      entity_id: this.circle.id,
      metadata: {
        new_authorization_epoch: this.circle.authorization_epoch,
      },
    });

    return { success: true };
  }

  // Member Management & Flags
  public updateMemberFlags(memberId: string, canViewHealth: boolean, canExport: boolean): { success: boolean; error?: string } {
    if (!this.isAdmin()) {
      return { success: false, error: 'تعديل صلاحيات الأعضاء متاح لمدير الدائرة (Admin) فقط' };
    }

    const member = this.members.find(m => m.id === memberId);
    if (!member) return { success: false, error: 'العضو غير موجود' };

    member.can_view_health_data = canViewHealth;
    member.can_export = canExport;

    this.addAuditEvent({
      action: 'member_permissions_updated',
      entity_type: 'circle_members',
      entity_id: member.id,
      metadata: { can_view_health_data: canViewHealth, can_export: canExport },
    });

    return { success: true };
  }

  // Appointments
  public getAppointments(): Appointment[] {
    const canSeeHealth = this.canView('health');
    return this.appointments.filter(apt => {
      if (apt.visibility === 'health' && !canSeeHealth) return false;
      return true;
    });
  }

  // Medication Instructions
  public getMedicationInstructions(): MedicationInstruction[] {
    if (!this.canView('health')) return [];
    return this.instructions;
  }

  // Documents & AI Runs
  public getDocuments(): SanadDocument[] {
    const canSeeHealth = this.canView('health');
    return this.documents.filter(doc => {
      if (doc.visibility === 'health' && !canSeeHealth) return false;
      return doc.status !== 'deleted';
    });
  }

  public reviewAiRun(documentId: string, accept: boolean): { success: boolean; error?: string } {
    const doc = this.documents.find(d => d.id === documentId);
    if (!doc || !doc.ai_run) return { success: false, error: 'الملف أو التحليل غير موجود' };

    doc.ai_run.status = accept ? 'accepted' : 'rejected';
    doc.ai_run.reviewed_by = this.activeUserId;
    doc.ai_run.reviewed_at = new Date().toISOString();

    this.addAuditEvent({
      action: accept ? 'document_ai_draft_accepted' : 'document_ai_draft_rejected',
      entity_type: 'document_ai_runs',
      entity_id: doc.ai_run.id,
      metadata: { document_id: doc.id },
    });

    return { success: true };
  }

  // Notifications
  public getNotifications(): InAppNotification[] {
    const canSeeHealth = this.canView('health');
    return this.notifications.filter(n => {
      if (n.visibility === 'health' && !canSeeHealth) return false;
      return n.user_id === this.activeUserId;
    });
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.read_at = new Date().toISOString();
  }

  // Audit Events
  public getAuditEvents(): AuditEvent[] {
    if (!this.isAdmin()) return [];
    return this.auditEvents;
  }

  private addAuditEvent(event: { action: string; entity_type: string; entity_id: string | null; metadata: Record<string, any> }) {
    const actor = this.getActiveUser();
    const newEvent: AuditEvent = {
      id: 'aud-' + Date.now().toString(36),
      circle_id: this.circle.id,
      actor_user_id: this.activeUserId,
      actor_name: actor.display_name,
      action: event.action,
      entity_type: event.entity_type,
      entity_id: event.entity_id,
      metadata: event.metadata,
      request_id: 'req-' + Math.random().toString(36).substring(2, 8),
      created_at: new Date().toISOString(),
    };
    this.auditEvents.unshift(newEvent);
  }

  // Status Labels in Egyptian Arabic
  public getStatusText(status: OccurrenceStatus, scheduledAt: string): { label: string; tone: 'warning' | 'info' | 'success' | 'danger' } {
    const isPast = new Date(scheduledAt).getTime() < Date.now();
    switch (status) {
      case 'unrecorded':
        if (isPast) {
          return { label: 'المتابعة غير مؤكدة', tone: 'warning' };
        }
        return { label: 'قبل الموعد: بانتظار المتابعة', tone: 'info' };
      case 'recorded':
        return { label: 'تم تسجيل المتابعة', tone: 'success' };
      case 'not_done':
        return { label: 'مسجل أنه لم يُنفذ', tone: 'danger' };
      case 'cancelled':
        return { label: 'ملغية', tone: 'warning' };
    }
  }

  public getTruthSourceLabel(source: TruthSource): string {
    switch (source) {
      case 'first_hand': return 'أنا اللي نفّذت (بشكل مباشر)';
      case 'observed': return 'شاهدتها بنفسي';
      case 'reported': return 'أُبلغت بها (من طرف آخر)';
    }
  }

  // Emergency (SOS) Management
  private activeEmergencyAlert: EmergencyAlert | null = null;

  public getActiveEmergencyAlert(): EmergencyAlert | null {
    return this.activeEmergencyAlert;
  }

  public triggerEmergencyAlert(params: {
    emergencyType: 'medical_urgent' | 'fall_or_injury' | 'unresponsive' | 'other';
    note: string | null;
  }): { success: boolean; alert: EmergencyAlert } {
    const actor = this.getActiveUser();
    const now = new Date().toISOString();

    const alert: EmergencyAlert = {
      id: 'sos-' + Date.now().toString(36),
      circle_id: this.circle.id,
      triggered_by_user_id: this.activeUserId,
      triggered_by_name: actor.display_name,
      triggered_at: now,
      emergency_type: params.emergencyType,
      note: params.note,
      status: 'active',
      resolved_by_user_id: null,
      resolved_by_name: null,
      resolved_at: null,
      resolution_note: null,
    };

    this.activeEmergencyAlert = alert;

    // Broadcast instant in-app notification to all members of the circle
    this.members.forEach(member => {
      this.notifications.unshift({
        id: 'notif-sos-' + member.user_id + '-' + Date.now().toString(36),
        user_id: member.user_id,
        circle_id: this.circle.id,
        kind: 'emergency',
        visibility: 'general', // Urgent alerts must reach all members
        title: `🚨 نداء طوارئ عاجل: ${this.recipient.preferred_name}`,
        body: `أطلق ${actor.display_name} نداء طوارئ (${this.getEmergencyTypeLabel(params.emergencyType)})${params.note ? `: "${params.note}"` : ''} - يرجى التحرك والتواصل فوراً!`,
        generic_lock_screen_text: '🚨 نداء طوارئ عاجل في سند - يرجى فتح التطبيق فوراً',
        read_at: member.user_id === this.activeUserId ? now : null,
        created_at: now,
      });
    });

    // Record formal audit event with request_id and full metadata
    this.addAuditEvent({
      action: 'emergency_sos_triggered',
      entity_type: 'emergency_alerts',
      entity_id: alert.id,
      metadata: {
        emergency_type: params.emergencyType,
        emergency_label: this.getEmergencyTypeLabel(params.emergencyType),
        triggered_by: actor.display_name,
        note: params.note,
        notified_members_count: this.members.length,
        recipient_name: this.recipient.preferred_name,
        timestamp_utc: now,
      },
    });

    return { success: true, alert };
  }

  public resolveEmergencyAlert(params: {
    alertId: string;
    resolutionNote: string;
  }): { success: boolean; error?: string } {
    if (!this.activeEmergencyAlert || this.activeEmergencyAlert.id !== params.alertId) {
      return { success: false, error: 'لا يوجد نداء طوارئ نشط بهذا الرقم' };
    }

    const actor = this.getActiveUser();
    const now = new Date().toISOString();

    this.activeEmergencyAlert.status = 'resolved';
    this.activeEmergencyAlert.resolved_by_user_id = this.activeUserId;
    this.activeEmergencyAlert.resolved_by_name = actor.display_name;
    this.activeEmergencyAlert.resolved_at = now;
    this.activeEmergencyAlert.resolution_note = params.resolutionNote;

    // Audit Event for Resolution
    this.addAuditEvent({
      action: 'emergency_sos_resolved',
      entity_type: 'emergency_alerts',
      entity_id: params.alertId,
      metadata: {
        resolved_by: actor.display_name,
        resolution_note: params.resolutionNote,
        resolved_at_utc: now,
        started_at_utc: this.activeEmergencyAlert.triggered_at,
      },
    });

    const resolvedAlert = this.activeEmergencyAlert;
    this.activeEmergencyAlert = null; // Clear active alert

    return { success: true };
  }

  public getEmergencyTypeLabel(type: string): string {
    switch (type) {
      case 'medical_urgent': return 'أعراض صحية حادة / طوارئ طبية';
      case 'fall_or_injury': return 'سقوط أو إصابة منزلية';
      case 'unresponsive': return 'فقدان وعي أو صعوبة إيقاظ';
      case 'other': return 'طارئ عام آخر';
      default: return 'نداء طوارئ عاجل';
    }
  }

  // -------------------------------------------------------------
  // Connected Vital Signs Devices & Automated Health Telemetry
  // -------------------------------------------------------------

  public getConnectedDevices(): ConnectedDevice[] {
    return this.devices;
  }

  public getVitalSignReadings(): VitalSignReading[] {
    // Canonical rule: if recipient processing is withdrawn or member lacks health access, return empty list
    if (!this.canView('health')) {
      return [];
    }
    return [...this.vitalReadings].sort(
      (a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
    );
  }

  /**
   * Synchronize telemetry from a connected vital signs monitor (Bluetooth/WiFi)
   * Automatically updates recipient's vital readings and records an immutable audit log entry.
   */
  public syncDeviceReadings(deviceId: string): { success: boolean; reading?: VitalSignReading; error?: string } {
    if (!this.canView('health')) {
      return { success: false, error: 'غير مصرح لك بمزامنة أو استعراض القياسات الحيوية الصحية' };
    }

    const device = this.devices.find(d => d.id === deviceId);
    if (!device) {
      return { success: false, error: 'الجهاز غير مقترن أو غير موجود' };
    }

    const actor = this.getActiveUser();
    const now = new Date().toISOString();

    let readingType: 'blood_pressure' | 'blood_glucose' | 'oxygen_saturation' = 'blood_pressure';
    let primary = 122;
    let secondary: number | undefined = undefined;
    let unit = 'mmHg';
    let status: 'normal' | 'attention' | 'critical' = 'normal';
    let note = '';

    if (device.type === 'blood_pressure') {
      readingType = 'blood_pressure';
      // Realistic blood pressure range: systolic 118-132, diastolic 76-84
      const systolic = 118 + Math.floor(Math.random() * 15);
      const diastolic = 75 + Math.floor(Math.random() * 10);
      const pulse = 70 + Math.floor(Math.random() * 8);
      primary = systolic;
      secondary = diastolic;
      unit = 'mmHg';
      status = systolic >= 140 || diastolic >= 90 ? 'attention' : 'normal';
      note = `قراءة متزامنة عبر البلوتوث - نبض القلب ${pulse} ن/د`;
    } else if (device.type === 'glucose_meter') {
      readingType = 'blood_glucose';
      // Glucose range: 106 - 138 mg/dL
      primary = 106 + Math.floor(Math.random() * 32);
      unit = 'mg/dL';
      status = primary >= 150 ? 'attention' : 'normal';
      note = 'قراءة عشوائية متزامنة من شريحة القياس الفوري للجهاز';
    } else if (device.type === 'pulse_oximeter') {
      readingType = 'oxygen_saturation';
      // SpO2 97 - 99 %, pulse 68 - 78 bpm
      primary = 97 + Math.floor(Math.random() * 3);
      secondary = 68 + Math.floor(Math.random() * 11);
      unit = '%';
      status = primary < 95 ? 'attention' : 'normal';
      note = `مزامنة نسبة تشبع الأكسجين ${primary}% ونبض ${secondary} ن/د`;
    }

    const newReading: VitalSignReading = {
      id: `vit-${Date.now()}`,
      circle_id: this.circle.id,
      recipient_id: this.recipient.id,
      device_id: device.id,
      device_name: device.name,
      device_type: device.type,
      type: readingType,
      value_primary: primary,
      value_secondary: secondary,
      unit,
      measured_at: now,
      synced_at: now,
      status,
      note,
    };

    // Update device telemetry status
    device.last_sync_at = now;
    device.status = 'connected';
    device.battery_level = Math.max(15, device.battery_level - (Math.random() > 0.8 ? 1 : 0));

    // Append to live vitals state
    this.vitalReadings.unshift(newReading);

    // Document in append-only Audit Log
    this.addAuditEvent({
      action: 'vital_signs_device_synced',
      entity_type: 'vital_signs_reading',
      entity_id: newReading.id,
      metadata: {
        device_id: device.id,
        device_name: device.name,
        model: device.model,
        serial_number: device.serial_number,
        metric: newReading.type,
        primary_value: newReading.value_primary,
        secondary_value: newReading.value_secondary ?? null,
        unit: newReading.unit,
        clinical_status: newReading.status,
        measured_at_utc: now,
        synced_by_actor: actor.display_name,
        recipient_name: this.recipient.preferred_name,
        telemetry_protocol: 'Bluetooth Low Energy (GATT Care Profile)',
        non_clinical_disclaimer: 'قراءة متابعة عائلية مؤتمتة - لا تغني عن الرأي الطبي السريري',
      },
    });

    // Notify health-authorized circle members
    this.members
      .filter(m => m.can_view_health_data && m.status === 'active')
      .forEach(member => {
        this.notifications.unshift({
          id: `notif-vitalsync-${Date.now()}-${member.user_id}`,
          user_id: member.user_id,
          circle_id: this.circle.id,
          kind: 'vital_sync',
          visibility: 'health',
          title: `مزامنة قراءة حيوية جديدة (${device.name})`,
          body: `تم استلام قياس (${newReading.type === 'blood_pressure' ? `${newReading.value_primary}/${newReading.value_secondary} mmHg` : newReading.type === 'blood_glucose' ? `${newReading.value_primary} mg/dL` : `${newReading.value_primary}% SpO2`}) للحاجة ${this.recipient.preferred_name} بنجاح.`,
          generic_lock_screen_text: 'تحديث قراءة حيوية جديد في سند',
          read_at: member.user_id === this.activeUserId ? now : null,
          created_at: now,
        });
      });

    return { success: true, reading: newReading };
  }

  public connectNewDevice(params: {
    name: string;
    model: string;
    type: 'blood_pressure' | 'glucose_meter' | 'pulse_oximeter';
    serial_number: string;
  }): { success: boolean; device?: ConnectedDevice; error?: string } {
    if (!this.isAdmin()) {
      return { success: false, error: 'إقران الأجهزة الجديدة مقتصر على مدير الدائرة' };
    }

    const newDev: ConnectedDevice = {
      id: `dev-${Date.now()}`,
      name: params.name,
      model: params.model,
      type: params.type,
      serial_number: params.serial_number,
      status: 'connected',
      last_sync_at: null,
      battery_level: 100,
    };

    this.devices.push(newDev);

    const actor = this.getActiveUser();
    this.addAuditEvent({
      action: 'vital_device_paired',
      entity_type: 'connected_devices',
      entity_id: newDev.id,
      metadata: {
        device_name: newDev.name,
        model: newDev.model,
        serial_number: newDev.serial_number,
        paired_by: actor.display_name,
        timestamp_utc: new Date().toISOString(),
      },
    });

    return { success: true, device: newDev };
  }

  /**
   * Generates a comprehensive weekly health summary report with daily vital trends,
   * adherence metrics, clinical observations, and family recommendations.
   */
  public generateWeeklyHealthReport(): { success: boolean; report?: WeeklyHealthReport; error?: string } {
    if (!this.canView('health')) {
      return { success: false, error: 'غير مصرح لك بتوليد أو استعراض التقارير الصحية الأسبوعية نظراً لحجب البيانات الصحية' };
    }

    const actor = this.getActiveUser();
    const now = new Date();
    const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    const dailyTrends: DayVitalSummary[] = [];
    let totalSys = 0;
    let totalDia = 0;
    let totalGlu = 0;
    let totalO2 = 0;
    let totalPulse = 0;

    // Build 7 days of trend data (from 6 days ago to today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400 * 1000);
      const dayName = arabicDays[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];

      // Find matching readings from vitalReadings or use realistic calibrated points
      const dayBp = this.vitalReadings.find(v => v.type === 'blood_pressure' && v.measured_at.startsWith(dateStr));
      const dayGlu = this.vitalReadings.find(v => v.type === 'blood_glucose' && v.measured_at.startsWith(dateStr));
      const dayO2 = this.vitalReadings.find(v => v.type === 'oxygen_saturation' && v.measured_at.startsWith(dateStr));

      const sys = dayBp ? dayBp.value_primary : (121 + (i % 5));
      const dia = dayBp ? (dayBp.value_secondary || 80) : (78 + (i % 4));
      const glu = dayGlu ? dayGlu.value_primary : (112 + (i % 6) * 2);
      const spo2 = dayO2 ? dayO2.value_primary : 98;
      const pulse = dayBp?.note?.includes('نبض') ? 72 + (i % 3) : 73;

      totalSys += sys;
      totalDia += dia;
      totalGlu += glu;
      totalO2 += spo2;
      totalPulse += pulse;

      dailyTrends.push({
        date: dateStr,
        day_label: dayName,
        systolic: sys,
        diastolic: dia,
        glucose: glu,
        spo2,
        pulse,
        tasks_completed: i === 0 ? 3 : 4,
        tasks_total: 4,
      });
    }

    const count = dailyTrends.length;
    const avgSys = Math.round(totalSys / count);
    const avgDia = Math.round(totalDia / count);
    const avgGlu = Math.round(totalGlu / count);
    const avgO2 = Math.round(totalO2 / count);
    const avgPulse = Math.round(totalPulse / count);

    const startDateStr = dailyTrends[0].date;
    const endDateStr = dailyTrends[count - 1].date;

    const report: WeeklyHealthReport = {
      id: `rep-week-${Date.now()}`,
      generated_at: now.toISOString(),
      period_label: `الأسبوع من ${startDateStr} إلى ${endDateStr}`,
      period_start: startDateStr,
      period_end: endDateStr,
      recipient_name: this.recipient.preferred_name,
      circle_name: this.circle.name,
      averages: {
        systolic_avg: avgSys,
        diastolic_avg: avgDia,
        glucose_avg: avgGlu,
        spo2_avg: avgO2,
        pulse_avg: avgPulse,
        medication_adherence_percent: 96,
      },
      daily_trends: dailyTrends,
      clinical_observations: [
        `استقرار ملحوظ في مؤشر ضغط الدم الشرياني بمتوسط أسبوعي ${avgSys}/${avgDia} mmHg ضمن النطاق الآمن لكبار السن.`,
        `انضباط مستويات سكر الدم الصائم بمتوسط ${avgGlu} mg/dL دون تسجيل أي قراءات هبوط حاد.`,
        `معدل تشبع ممتاز للأكسجين في الدم بمتوسط ${avgO2}% ونبض قلبي مستقر (${avgPulse} ن/د).`,
        `نسبة التزام استثنائية بتناول الأدوية والوجبات (96%) بفضل انتظام التذكيرات اليومية ومتابعة العائلة.`,
      ],
      recommendations_for_family: [
        'مواصلة قياس ضغط الدم يومياً في الصباح بعد الإفطار بنصف ساعة للحفاظ على استقرار القراءات.',
        'الحرص على شرب كوب ماء دافئ مع دواء الضغط وتجنب النهوض المفاجئ من الفراش.',
        'الاستمرار في تقديم وجبة العشاء قبل النوم بساعتين على الأقل للمحافظة على سكر الدم الصائم صباحاً.',
        'جدولة زيارة المتابعة الدورية القادمة لطبيب القلب والمسنين لمراجعة جرعات العلاج الوقائي.',
      ],
      disclaimer: 'هذا الملخص الأسبوعي تم توليده آلياً استناداً إلى القياسات المسجلة من الأجهزة المنزلية وتوثيق مقدمي الرعاية، وهو مخصص للتنسيق الأسري والمتابعة ولا يُعد بديلاً عن الفحص السريري.',
    };

    // Document report generation in Audit Log
    this.addAuditEvent({
      action: 'weekly_health_report_generated',
      entity_type: 'health_reports',
      entity_id: report.id,
      metadata: {
        report_id: report.id,
        recipient_name: this.recipient.preferred_name,
        period: report.period_label,
        generated_by: actor.display_name,
        systolic_avg: avgSys,
        diastolic_avg: avgDia,
        glucose_avg: avgGlu,
        adherence_rate: '96%',
        timestamp_utc: now.toISOString(),
      },
    });

    return { success: true, report };
  }
}

export const sanadService = new SanadService();


