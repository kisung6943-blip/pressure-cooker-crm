export const STATUSES = [
  '수거접수',
  '입고',
  '수리',
  '완료',
  '문자안내',
  '결제확인',
  '출고',
] as const;

export type ASStatus = (typeof STATUSES)[number];

export interface Client {
  id: string;
  name: string;
  contact: string;
  address: string;
  model: string;
  asDetails: string;
  status: ASStatus;
  price: number;
  trackingNumber?: string;
  quotationUrl?: string;
  createdAt: string;
  updatedAt: string;
}
