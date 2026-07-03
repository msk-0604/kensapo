export type ProjectStatus = "not_started" | "in_progress" | "completed";

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

export interface SitePhoto {
  id: string;
  project_id: string;
  image_url: string;
  storage_path: string | null;
  comment: string | null;
  taken_at: string | null;
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
