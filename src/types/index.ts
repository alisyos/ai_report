// 목차 생성 관련 타입
export interface OutlineFormData {
  purpose: string;
  topic: string;
  audience: 'internal_team' | 'executives' | 'general_public';
  content: string;
  contentType: 'text' | 'file';
  tone: 'formal' | 'friendly' | 'professional';
}

export interface OutlineStructure {
  heading: string;
  subheadings?: string[];
}

export interface OutlineResponse {
  title: string;
  structure: OutlineStructure[];
}

// 보고서 생성 관련 타입
export interface ReportFormData {
  titleStructure: OutlineResponse;
  audience: 'internal_team' | 'executives' | 'general_public';
  content: string;
  tone: 'formal' | 'friendly' | 'professional';
}

export interface ReportSection {
  subheading: string;
  content: string[];
}

export interface ReportItem {
  heading: string;
  sections?: ReportSection[];
  content?: string[];
}

export interface ReportResponse {
  title: string;
  report: ReportItem[];
} 