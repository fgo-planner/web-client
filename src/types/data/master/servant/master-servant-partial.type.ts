import { MasterServant } from '@fgo-planner/types';

export type MasterServantPartial = Partial<MasterServant> & Pick<MasterServant, 'gameId' | 'instanceId'>;
