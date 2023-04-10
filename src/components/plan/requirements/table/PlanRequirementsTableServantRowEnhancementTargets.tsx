import { Immutable } from '@fgo-planner/common-core';
import { PlanServantAggregatedData } from '@fgo-planner/data-core';
import clsx from 'clsx';
import React, { ReactNode } from 'react';
import { ComponentStyleProps } from '../../../../types';
import { PlanRequirementsTableServantRowAscensionTarget } from './PlanRequirementsTableServantRowAscensionTarget';
import { PlanRequirementsTableServantRowCostumeTarget } from './PlanRequirementsTableServantRowCostumeTarget';
import { PlanRequirementsTableServantRowLevelTarget } from './PlanRequirementsTableServantRowLevelTarget';
import { PlanRequirementsTableServantRowSkillTargets } from './PlanRequirementsTableServantRowSkillTargets';

type Props = {
    planServantData: Immutable<PlanServantAggregatedData>;
    targetCostumes: ReadonlySet<number>;
    unlockedCostumes: ReadonlySet<number>;
} & Pick<ComponentStyleProps, 'className'>;

const ArrowCharacter = '\u279C';

export const StyleClassPrefix = 'PlanRequirementsTableServantRowEnhancementTargets';

/**
 * Wrapping this component in React.memo is unnecessary because a re-render of
 * the parent components will always trigger a re-render of this component
 * anyways.
 */
/** */
export const PlanRequirementsTableServantRowEnhancementTargets: React.FC<Props> = (props: Props): JSX.Element => {

    const {
        planServantData,
        targetCostumes,
        unlockedCostumes,
        className
    } = props;

    const arrowCharacterNode: ReactNode = (
        <span className={`${StyleClassPrefix}-arrow`}>
            {ArrowCharacter}
        </span>
    );

    const classNames = clsx(
        className,
        `${StyleClassPrefix}-root`
    );

    return (
        <div className={classNames}>
            <div className={`${StyleClassPrefix}-row`}>
                <PlanRequirementsTableServantRowLevelTarget
                    arrowCharacter={arrowCharacterNode}
                    planServantData={planServantData}
                />
                <PlanRequirementsTableServantRowSkillTargets
                    arrowCharacter={arrowCharacterNode}
                    planServantData={planServantData}
                    skillSet='skills'
                />
            </div>
            <div className={`${StyleClassPrefix}-row`}>
                <PlanRequirementsTableServantRowAscensionTarget
                    arrowCharacter={arrowCharacterNode}
                    planServantData={planServantData}
                />
                <PlanRequirementsTableServantRowCostumeTarget
                    planServantData={planServantData}
                    targetCostumes={targetCostumes}
                    unlockedCostumes={unlockedCostumes}
                />
                <PlanRequirementsTableServantRowSkillTargets
                    arrowCharacter={arrowCharacterNode}
                    planServantData={planServantData}
                    skillSet='appendSkills'
                />
            </div>
        </div>
    );

};
