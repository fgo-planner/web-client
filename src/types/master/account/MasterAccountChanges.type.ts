import { ImmutableRecord } from '@fgo-planner/common-core';
import { MasterAccountChangeType } from './MasterAccountChangeType.enum';

export type MasterAccountChanges = ImmutableRecord<string, MasterAccountChangeType>;
