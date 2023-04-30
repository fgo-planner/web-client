import { Immutable, ReadonlyRecord } from '@fgo-planner/common-core';
import { PlanServantAggregatedData } from '@fgo-planner/data-core';
import clsx from 'clsx';
import React, { ReactNode } from 'react';
import { ServantThumbnail } from '../../../servant/ServantThumbnail';
import { TruncateText } from '../../../text/TruncateText';
import { PlanRequirementsTableServantRowEnhancementTargets } from './PlanRequirementsTableServantRowEnhancementTargets';

type Props = {
    planServantData: Immutable<PlanServantAggregatedData>;
    servantRowHeaderMode: 'name' | 'targets' | 'toggle';
    targetCostumes: ReadonlySet<number>;
    unlockedCostumes: ReadonlyRecord<number, boolean>;
};

export const StyleClassPrefix = 'PlanRequirementsTableServantRowHeader';

/**
 * Wrapping this component in React.memo is unnecessary because it is very basic
 * and a re-render of the parent component (`PlanRequirementsTableServantRow`)
 * will always trigger a re-render of this component anyways.
 */
/** */
export const PlanRequirementsTableServantRowHeader: React.FC<Props> = (props: Props): JSX.Element => {

    const {
        planServantData,
        servantRowHeaderMode,
        targetCostumes,
        unlockedCostumes
    } = props;

    const gameServant = planServantData.gameServant;

    const contentNodeClassName = clsx(
        `${StyleClassPrefix}-content`,
        `${StyleClassPrefix}-${servantRowHeaderMode}`
    );

    let contentNode: ReactNode;
    if (servantRowHeaderMode === 'toggle') {
        contentNode = (
            <div className={contentNodeClassName}>
                toggle
            </div>
        );
    } else if (servantRowHeaderMode === 'targets') {
        contentNode = (
            <PlanRequirementsTableServantRowEnhancementTargets
                className={contentNodeClassName}
                planServantData={planServantData}
                targetCostumes={targetCostumes}
                unlockedCostumes={unlockedCostumes}
            />
        );
    } else {
        contentNode = (
            <TruncateText className={contentNodeClassName}>
                {gameServant.name}
            </TruncateText>
        );
    }

    return (
        <div className={`${StyleClassPrefix}-root`}>
            <ServantThumbnail
                gameServant={gameServant}
                size='3.25em'  // TODO Un-hardcode this
            />
            <div className={`${StyleClassPrefix}-hover-overlay`} />
            {contentNode} 
        </div>
    );

};
