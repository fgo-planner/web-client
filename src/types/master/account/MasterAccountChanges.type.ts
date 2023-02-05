import { ReadonlyRecord } from '@fgo-planner/common-core';

// TODO Convert this to an enum
export type MasterAccountChange = 'Created' | 'Updated' | 'Deleted';

export type MasterAccountChanges = ReadonlyRecord<string, MasterAccountChange>;
