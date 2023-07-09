import { MasterAccount } from '@fgo-planner/data-core';

export type MasterAccountMetadata = Pick<MasterAccount, '_id' | 'createdAt' | 'updatedAt'>;
