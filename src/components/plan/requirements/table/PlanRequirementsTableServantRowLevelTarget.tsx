import { Immutable } from '@fgo-planner/common-core';
import { PlanServantAggregatedData } from '@fgo-planner/data-core';
import clsx from 'clsx';
import React, { ReactNode } from 'react';

type Props = {
    arrowCharacter: ReactNode;
    planServantData: Immutable<PlanServantAggregatedData>;
};

export const StyleClassPrefix = 'PlanRequirementsTableServantRowLevelTarget';

/**
 * Wrapping this component in React.memo is unnecessary because a re-render of
 * the parent components will always trigger a re-render of this component
 * anyways.
 */
/** */
export const PlanRequirementsTableServantRowLevelTarget: React.FC<Props> = (props: Props): JSX.Element => {

    const {
        arrowCharacter,
        planServantData: {
            masterServant: {
                level: current
            },
            planServant: {
                enabled: {
                    ascensions: levelEnabled
                },
                level: target
            }
        }
    } = props;

    const isTargetActionable = target !== undefined && target > current;

    // TODO Also account for the plan-wide enable flag.
    const enabled = levelEnabled && isTargetActionable;

    const className = clsx(
        `${StyleClassPrefix}-root`,
        !enabled && `${StyleClassPrefix}-disabled`,
    );

    return (
        <div className={className}>
            <span>Lv.</span>
            {current}
            {target && <>{arrowCharacter} {target}</>}
        </div>
    );

};
