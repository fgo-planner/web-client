import { Immutable } from '@fgo-planner/common-core';
import { PlanServantAggregatedData } from '@fgo-planner/data-core';
import clsx from 'clsx';
import React, { ReactNode } from 'react';
import { AssetConstants } from '../../../../constants';

type Props = {
    arrowCharacter: ReactNode;
    planServantData: Immutable<PlanServantAggregatedData>;
};

export const StyleClassPrefix = 'PlanRequirementsTableServantRowAscensionTarget';

/**
 * Wrapping this component in React.memo is unnecessary because a re-render of
 * the parent components will always trigger a re-render of this component
 * anyways.
 */
/** */
export const PlanRequirementsTableServantRowAscensionTarget: React.FC<Props> = (props: Props): JSX.Element => {

    const {
        arrowCharacter,
        planServantData: {
            masterServant: {
                ascension: current
            },
            planServant: {
                enabled: {
                    ascensions: ascensionEnabled
                },
                ascension: target
            }
        }
    } = props;

    const isTargetActionable = target !== undefined && target > current;

    // TODO Also account for the plan-wide enable flag.
    const enabled = ascensionEnabled && isTargetActionable;

    const iconUrl = enabled ? AssetConstants.ServantAscensionOnIcon : AssetConstants.ServantAscensionOffIcon;

    const className = clsx(
        `${StyleClassPrefix}-root`,
        !enabled && `${StyleClassPrefix}-disabled`
    );

    return (
        <div className={className}>
            <img src={iconUrl} alt='Ascension' />
            <div>
                {current}
                {target !== undefined && <>{arrowCharacter} {target}</>}
            </div>
        </div>
    );

};
