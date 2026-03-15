// Session mode enum matching backend
export type SessionMode = 'ONLINE' | 'OFFLINE';

// Session response from API
export interface SessionResponse {
  id: number;
  curriculumId: number;
  sessionNumber: number;
  title: string;
  content: string;
  sessionDate: string | null;
  sessionTime: string | null;
  sessionMode: SessionMode;
  meetingLink: string | null;
  meetingLocation: string | null;
}

// Session request for create/update
export interface SessionRequest {
  sessionNumber: number;
  title: string;
  content: string;
  sessionDate: string | null;
  sessionTime: string | null;
  sessionMode: SessionMode;
  meetingLink: string | null;
  meetingLocation: string | null;
}

// Curriculum response from API
export interface CurriculumResponse {
  id: number;
  studyId: number;
  weekNumber: number;
  title: string;
  content: string;
  sessionCount: number;
  sessions: SessionResponse[] | null;
}

// Curriculum update request
export interface CurriculumUpdateRequest {
  title: string;
  content: string;
}
