export interface RecruitmentRequest {
  id: string;
  post: string;
  effective: number;
  contract?: string;
  wishedDate?: string;
  status?: string;
  sendingDate?: string;
}
