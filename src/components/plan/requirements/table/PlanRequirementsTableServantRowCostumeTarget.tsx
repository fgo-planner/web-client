import { Immutable } from '@fgo-planner/common-core';
import { PlanServantAggregatedData } from '@fgo-planner/data-core';
import React, { useMemo } from 'react';
import { IconOutlined } from '../../../icons/IconOutlined';

type Props = {
    planServantData: Immutable<PlanServantAggregatedData>;
    targetCostumes: ReadonlySet<number>;
    unlockedCostumes: ReadonlySet<number>;
};

export const StyleClassPrefix = 'PlanRequirementsTableServantRowCostumeTarget';

/**
 * Wrapping this component in React.memo is unnecessary because a re-render of
 * the parent components will always trigger a re-render of this component
 * anyways.
 */
/** */
export const PlanRequirementsTableServantRowCostumeTarget: React.FC<Props> = (props: Props): JSX.Element | null => {

    const {
        planServantData: {
            gameServant
        },
        targetCostumes,
        unlockedCostumes
    } = props;

    const targetCostumesCount = useMemo((): number => {
        let count = 0;
        for (const key of Object.keys(gameServant.costumes)) {
            const costumeId = Number(key);
            if (targetCostumes.has(costumeId) && !unlockedCostumes.has(costumeId)) {
                count++;
            }
        }
        return count;
    }, [gameServant.costumes, targetCostumes, unlockedCostumes]);

    if (!targetCostumesCount) {
        return null;
    }

    return (
        <div className={`${StyleClassPrefix}-root`}>
            <IconOutlined>theater_comedy</IconOutlined>
            <div>
                {targetCostumesCount}
                </div>
        </div>
    );

};
