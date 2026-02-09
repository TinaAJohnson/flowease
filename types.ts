
export enum AppointmentStatus {
  CONFIRMED = 'Confirmed',
  PENDING = 'Pending',
  NEEDS_ATTENTION = 'Needs Attention',
  CANCELLED = 'Cancelled',
  RESCHEDULE_REQUESTED = 'Reschedule Requested'
}

export enum SoundType {
  ALARM = 'Alarm',
  GENTLE = 'Gentle',
  SILENCE = 'Silence'
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // minutes
  status: AppointmentStatus;
  remindersSent: number;
  lastReminderAt: string | null;
  isInvoiced: boolean;
  cancelReason?: string;
  isSynced: boolean;
  notes?: string;
}

export interface Invoice {
  id: string;
  appointmentId: string;
  patientName: string;
  amount: number;
  date: string;
  status: string;
  notes?: string;
}

export enum CalendarProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  ICLOUD = 'icloud'
}

export interface CalendarIntegration {
  provider: CalendarProvider;
  isConnected: boolean;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  lastSyncedAt?: string;
  syncEnabled: boolean;
  selectedCalendarId?: string;
}

export interface PracticeSettings {
  notificationSound: SoundType;
  autoInvoice: boolean;
  reminderFrequency: number;
  criticalThresholdHours: number;
  workDayStart: string;
  workDayEnd: string;
  sessionLength: number;
  googleCalendarEmail: string;
  calendarIntegrations: Record<CalendarProvider, CalendarIntegration>;
}

export type ViewState = 'landing' | 'dashboard' | 'scheduling' | 'billing' | 'settings';
