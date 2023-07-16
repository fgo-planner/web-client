export type OmitAccountId<T extends { accountId: string }> = Omit<T, 'accountId'>;
