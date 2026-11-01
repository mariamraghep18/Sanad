export type UserRole = 'admin' | 'caregiver' | 'viewer';

export type TaskCategory = 'general' | 'medication_followup' | 'appointment_logistics';

export type VisibilityScope = 'general' | 'health';

export type OccurrenceStatus = 'unrecorded' | 'recorded' | 'not_done' | 'cancelled';

export type TruthSource = 'first_hand' | 'observed' | 'reported';

export type RecordResult = 'done' | 'not_done';

export type AssignmentState = 'pending' | 'accepted' | 'declined' | 'reassigned' | 'cancelled';

export type DocumentStatus = 'upload_pending' | 'active' | 'deleted' | 'quarantined';

export type AiRunStatus = 'queued' | 'running' | 'review_required' | 'accepted' | 'rejected' | 'failed' | 'cancelled';

export interface Profile {
  id: string;
  display_name: string;
  phone_e164: string | null;
  locale: string;
  timezone: string;
  status: 'active' | 'disabled' | 'deleted';
}

export interface CareCircle {
  id: string;
  name: string;
  timezone: string;
  status: 'active' | 'paused' | 'closed';
  health_processing_enabled: boolean;
  authorization_epoch: number;
  consent_version: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CareRecipient {
  id: string;
  linked_user_id: string | null;
  preferred_name: string; // e.g. "الحاجة فاطمة"
  legal_name: string | null;
  birth_year: number | null;
  status: 'active' | 'archived' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface RecipientAuthorization {
  id: string;
  recipient_id: string;
  circle_id: string;
  kind: 'recipient_consent' | 'authorized_representative_attestation' | 'processing_withdrawal' | 'admin_authority_attestation';
  status: 'active' | 'revoked' | 'expired';
  version: number;
  attested_by_user_id: string;
  authority_basis: string | null;
  attestation_text: string;
  effective_at: string;
  revoked_at: string | null;
  created_at: string;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  role: UserRole;
  can_view_health_data: boolean;
  can_export: boolean;
  status: 'invited' | 'active' | 'removed' | 'revoked';
  consent_version: string;
  joined_at: string | null;
  removed_at: string | null;
  profile: Profile;
}

export interface TaskTemplate {
  id: string;
  circle_id: string;
  title: string;
  category: TaskCategory;
  visibility: VisibilityScope;
  timezone: string;
  recurrence_rule: string | null;
  active: boolean;
  current_version: number;
}

export interface TaskOccurrence {
  id: string;
  circle_id: string;
  template_id: string;
  template_version_id: string;
  title_snapshot: string;
  category: TaskCategory;
  visibility: VisibilityScope;
  timezone_snapshot: string;
  scheduled_at: string; // UTC ISO string
  due_window_end: string | null;
  status: OccurrenceStatus;
  row_version: number;
  cancelled_at: string | null;
  created_at: string;
  current_record?: CareRecord | null;
  current_assignment?: Assignment | null;
}

export interface Assignment {
  id: string;
  occurrence_id: string;
  circle_id: string;
  assignee_user_id: string | null;
  state: AssignmentState;
  assigned_by: string;
  responded_at: string | null;
  row_version: number;
  created_at: string;
  assignee_profile?: Profile;
}

export interface CareRecord {
  id: string;
  occurrence_id: string;
  circle_id: string;
  result: RecordResult;
  truth_source: TruthSource;
  actor_user_id: string;
  actor_profile?: Profile;
  reported_by_user_id: string | null;
  reported_by_label: string | null;
  observed_at: string | null;
  observed_time_unknown: boolean;
  recorded_at: string;
  note: string | null;
  row_version: number;
  record_kind: 'initial' | 'correction';
  supersedes_record_id: string | null;
  correction_reason: string | null;
}

export interface Appointment {
  id: string;
  circle_id: string;
  recipient_id: string;
  title: string;
  visibility: VisibilityScope;
  starts_at: string;
  ends_at: string | null;
  timezone_snapshot: string;
  location: string | null;
  status: 'planned' | 'confirmed' | 'cancelled' | 'completed';
  row_version: number;
  notes?: string | null;
}

export interface MedicationInstruction {
  id: string;
  circle_id: string;
  instruction_text: string;
  entered_by: string;
  source_label: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  status: 'draft' | 'confirmed' | 'retired';
}

export interface SanadDocument {
  id: string;
  circle_id: string;
  recipient_id: string | null;
  original_name: string;
  mime_type: string;
  byte_size: number;
  visibility: VisibilityScope;
  status: DocumentStatus;
  uploaded_by: string;
  uploaded_by_name?: string;
  created_at: string;
  deleted_at: string | null;
  ai_run?: DocumentAiRun | null;
}

export interface DocumentAiRun {
  id: string;
  document_id: string;
  circle_id: string;
  status: AiRunStatus;
  extracted_text: string | null;
  source_refs: Array<{ quote: string; location: string }>;
  model_name: string | null;
  prompt_version: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  circle_id: string;
  kind: 'task_reminder' | 'followup' | 'invite' | 'system' | 'emergency' | 'vital_sync';
  visibility: VisibilityScope;
  title: string;
  body: string;
  generic_lock_screen_text: string;
  read_at: string | null;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  circle_id: string | null;
  actor_user_id: string | null;
  actor_name?: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, any>;
  request_id: string;
  created_at: string;
}

export interface ExportJob {
  id: string;
  circle_id: string;
  requested_by: string;
  selection: {
    include_health: boolean;
    date_from: string;
    date_to: string;
    categories: TaskCategory[];
  };
  status: 'queued' | 'ready' | 'downloaded';
  created_at: string;
}

export interface EmergencyAlert {
  id: string;
  circle_id: string;
  triggered_by_user_id: string;
  triggered_by_name: string;
  triggered_at: string;
  emergency_type: 'medical_urgent' | 'fall_or_injury' | 'unresponsive' | 'other';
  note: string | null;
  status: 'active' | 'resolved';
  resolved_by_user_id: string | null;
  resolved_by_name: string | null;
  resolved_at: string | null;
  resolution_note: string | null;
}

export interface VitalSignReading {
  id: string;
  circle_id: string;
  recipient_id: string;
  device_id: string;
  device_name: string;
  device_type: 'blood_pressure' | 'glucose_meter' | 'pulse_oximeter' | 'weight_scale';
  type: 'blood_pressure' | 'blood_glucose' | 'oxygen_saturation' | 'heart_rate';
  value_primary: number; // e.g. 125 for BP systolic, or 118 for glucose mg/dL
  value_secondary?: number; // e.g. 82 for BP diastolic
  unit: string; // 'mmHg', 'mg/dL', '%', 'bpm'
  measured_at: string;
  synced_at: string;
  status: 'normal' | 'attention' | 'critical';
  note?: string | null;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  model: string;
  type: 'blood_pressure' | 'glucose_meter' | 'pulse_oximeter';
  serial_number: string;
  status: 'connected' | 'syncing' | 'offline';
  last_sync_at: string | null;
  battery_level: number;
}

export interface DayVitalSummary {
  date: string;
  day_label: string; // e.g. 'السبت', 'الأحد'
  systolic: number;
  diastolic: number;
  glucose: number;
  spo2: number;
  pulse: number;
  tasks_completed: number;
  tasks_total: number;
}

export interface WeeklyHealthReport {
  id: string;
  generated_at: string;
  period_label: string;
  period_start: string;
  period_end: string;
  recipient_name: string;
  circle_name: string;
  averages: {
    systolic_avg: number;
    diastolic_avg: number;
    glucose_avg: number;
    spo2_avg: number;
    pulse_avg: number;
    medication_adherence_percent: number;
  };
  daily_trends: DayVitalSummary[];
  clinical_observations: string[];
  recommendations_for_family: string[];
  disclaimer: string;
}



