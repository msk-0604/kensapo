export type ProjectStatus = "not_started" | "in_progress" | "completed";
export type WorkerStatus = "active" | "inactive";
export type ReportStatus = "draft" | "submitted";
export type ScheduleStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";
export type ProgressItemStatus = "pending" | "completed";

export interface Company {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  company_id: string;
  name: string;
  role: string;
  created_at: string;
}

/** DB: projects（UI上は「現場 / sites」） */
export interface Project {
  id: string;
  company_id: string;
  name: string;
  address: string | null;
  manager_name: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus;
  memo: string | null;
  created_at: string;
}

export type Site = Project;

export interface Worker {
  id: string;
  company_id: string;
  name: string;
  phone: string | null;
  trade: string | null;
  status: WorkerStatus;
  created_at: string;
}

export interface Schedule {
  id: string;
  company_id: string;
  project_id: string;
  worker_id: string | null;
  schedule_date: string;
  client_company_name: string | null;
  location: string | null;
  title: string | null;
  work_content: string | null;
  scheduled_start_time: string | null;
  scheduled_end_time: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
  memo: string | null;
  status: ScheduleStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectProgressItem {
  id: string;
  company_id: string;
  project_id: string;
  category: string;
  section: string | null;
  item_name: string;
  status: ProgressItemStatus;
  checked: boolean;
  checked_at: string | null;
  checked_by: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SitePhoto {
  id: string;
  project_id: string;
  image_url: string;
  storage_path: string | null;
  title: string | null;
  comment: string | null;
  taken_at: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface GenerateReportApiBody {
  projectId: string;
  reportId: string;
}

export interface DailyReport {
  id: string;
  project_id: string;
  report_date: string;
  weather: string | null;
  workers_count: number | null;
  work_content: string | null;
  materials: string | null;
  issues: string | null;
  next_plan: string | null;
  ai_report: string | null;
  created_by: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface DailyReportInput {
  report_date: string;
  weather: string;
  workers_count: number;
  work_content: string;
  materials: string;
  issues: string;
  next_plan: string;
}

export interface GeneratedReport {
  subject: string;
  todayWork: string;
  progress: string;
  confirmations: string;
  nextSchedule: string;
  messageToClient: string;
  formattedText: string;
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  company_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}
