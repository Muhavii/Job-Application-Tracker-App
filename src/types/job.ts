export type JobStatus = 'Applied' | 'Interview' | 'Offer' | 'Accepted' | 'Rejected';

export interface Job {
  id: string;
  company: string;
  role: string;
  dateApplied: string;
  status: JobStatus;
  notes?: string;
  updatedAt: string;
}
