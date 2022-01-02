import { PlanServantEnhancements } from '@fgo-planner/types';
import React, { FormEvent } from 'react';
import { ComponentStyleProps } from '../../../../../../types/internal';

type Props = {
    formId: string;

    currentEnhancements: Readonly<PlanServantEnhancements>;
    targetEnhancements: Readonly<PlanServantEnhancements>;
    unlockedCostumes: Array<number>;
    servantSelectDisabled?: boolean;
    layout?: 'dialog' | 'panel';
    readonly?: boolean;
    /**
     * Called when stats are changed via the form. For performance reasons, this is
     * only called for some fields on blur instead of on change.
     */
    onStatsChange?: (data: SubmitData) => void;
    onSubmit?: (event: FormEvent<HTMLFormElement>, data: SubmitData) => void;
} & Pick<ComponentStyleProps, 'className'>;


export type SubmitData = {
    // masterServant: Omit<MasterServant, 'instanceId'>;
    // bond: MasterServantBondLevel | undefined,
    costumes: Array<number>
};


