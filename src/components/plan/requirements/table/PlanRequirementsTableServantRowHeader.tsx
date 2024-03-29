import { Immutable, ReadonlyRecord } from '@fgo-planner/common-core';
import { PlanServantAggregatedData } from '@fgo-planner/data-core';
import clsx from 'clsx';
import React, { DragEventHandler, ReactNode } from 'react';
import { DataTableDragHandle } from '../../../data-table/DataTableDragHandle';
import { ServantThumbnail } from '../../../servant/ServantThumbnail';
import { TruncateText } from '../../../text/TruncateText';
import { PlanRequirementsTableServantRowEnhancementTargets } from './PlanRequirementsTableServantRowEnhancementTargets';
import { PlanRequirementsTableServantRowHeaderLayout } from './PlanRequirementsTableServantRowHeaderLayout.enum';

type Props = {
    dragDropMode?: boolean;
    planServantData: Immutable<PlanServantAggregatedData>;
    servantRowHeaderMode: PlanRequirementsTableServantRowHeaderLayout;
    targetCostumes: ReadonlySet<number>;
    unlockedCostumes: ReadonlyRecord<number, boolean>;
    onDragStart?: DragEventHandler;
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
        dragDropMode,
        planServantData,
        servantRowHeaderMode,
        targetCostumes,
        unlockedCostumes,
        onDragStart
    } = props;

    const gameServant = planServantData.gameServant;

    const dragHandleNode: ReactNode = dragDropMode && (
        <DataTableDragHandle
            onDragStart={onDragStart}
        />
    );

    const contentNodeClassName = clsx(
        `${StyleClassPrefix}-content`,
        `${StyleClassPrefix}-${servantRowHeaderMode}`
    );

    let contentNode: ReactNode;
    if (servantRowHeaderMode === PlanRequirementsTableServantRowHeaderLayout.Toggle) {
        contentNode = (
            <div className={contentNodeClassName}>
                toggle
            </div>
        );
    } else if (servantRowHeaderMode === PlanRequirementsTableServantRowHeaderLayout.Targets) {
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
            {dragHandleNode}
            <ServantThumbnail
                gameServant={gameServant}
                size='3.25em'  // TODO Un-hardcode this
            />
            <div className={`${StyleClassPrefix}-hover-overlay`} />
            {contentNode}
        </div>
    );

};
