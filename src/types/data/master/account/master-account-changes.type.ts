import { ReadonlyRecord } from '@fgo-planner/common-core';

export type MasterAccountChange = 'Created' | 'Updated' | 'Deleted';

export type MasterAccountChanges = ReadonlyRecord<string, MasterAccountChange>;
