import { httpClient } from '@shared/api/httpClient';

export interface BankCard {
  id: number;
  number: string;
  expirationDate: string;
  ownerFullName: string;
  customerId: number | null;
}

export interface SaveBankCardDto {
  number: string;
  expirationDate: string;
  cvv: string;
  ownerFullName: string;
}

export const bankCardApi = {
  getByCustomerId: (customerId: number): Promise<BankCard[]> =>
    httpClient.get<BankCard[]>(`/bank-cards/by-customer/${customerId}`).then((r) => r.data),

  create: (customerId: number, dto: SaveBankCardDto): Promise<BankCard> =>
    httpClient.post<BankCard>('/bank-cards', { ...dto, customerId }).then((r) => r.data),

  update: (id: number, dto: SaveBankCardDto): Promise<void> =>
    httpClient.put(`/bank-cards/${id}`, dto).then(() => undefined),

  remove: (id: number): Promise<void> =>
    httpClient.delete(`/bank-cards/${id}`).then(() => undefined),
};
