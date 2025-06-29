// 목차 생성 관련 타입
export interface OutlineFormData {
  purpose: string;
  topic: string;
  audience: 'internal_team' | 'executives' | 'clients' | 'general_public';
  content: string;
  contentType: 'text' | 'file';
  tone: 'formal' | 'professional' | 'analytical' | 'explanatory';
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
  audience: 'internal_team' | 'executives' | 'clients' | 'general_public';
  content: string;
  tone: 'formal' | 'professional' | 'analytical' | 'explanatory';
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

// 프롬프트 관리 관련 타입
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  type: 'outline' | 'report';
  createdAt: string;
  updatedAt: string;
}

export interface PromptUpdateRequest {
  name?: string;
  description?: string;
  content?: string;
} 