export type ProjectStatus = "not_started" | "in_progress" | "completed";
export type WorkerStatus = "active" | "inactive";
export type ReportStatus = "draft" | "submitted";

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
  worker_id: string;
  schedule_date: string;
  work_content: string | null;
  created_at: string;
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
