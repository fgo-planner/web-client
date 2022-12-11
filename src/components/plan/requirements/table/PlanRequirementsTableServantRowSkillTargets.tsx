import { Immutable } from '@fgo-planner/common-core';
import { InstantiatedServantConstants, InstantiatedServantSkillLevel, InstantiatedServantSkillSet, PlanServantAggregatedData } from '@fgo-planner/data-core';
import clsx from 'clsx';
import React, { ReactNode } from 'react';
import { ServantSkillLevel } from '../../../servant/ServantSkillLevels';

type Props = {
    arrowCharacter: ReactNode;
    planServantData: Immutable<PlanServantAggregatedData>;
    skillSet: InstantiatedServantSkillSet;
};

const isTargetActionable = (
    current: InstantiatedServantSkillLevel | undefined = InstantiatedServantConstants.MinSkillLevel,
    target: InstantiatedServantSkillLevel | undefined
): boolean => {
    return target !== undefined && target > current;
};

export const StyleClassPrefix = 'PlanRequirementsTableServantRowSkillTargets';

/**
 * Wrapping this component in React.memo is unnecessary because a re-render of
 * the parent components will always trigger a re-render of this component
 * anyways.
 */
/** */
export const PlanRequirementsTableServantRowSkillTargets: React.FC<Props> = (props: Props): JSX.Element => {

    const {
        arrowCharacter,
        planServantData: {
            masterServant,
            planServant
        },
        skillSet
    } = props;

    const currentSkills = masterServant[skillSet];
    const targetSkills = planServant[skillSet];

    const skill1TargetActionable = isTargetActionable(currentSkills[1], targetSkills[1]);
    const skill2TargetActionable = isTargetActionable(currentSkills[2], targetSkills[2]);
    const skill3TargetActionable = isTargetActionable(currentSkills[3], targetSkills[3]);

    // TODO Also account for the plan-wide enable flag.
    const enabled = planServant.enabled[skillSet] && (
        skill1TargetActionable ||
        skill2TargetActionable ||
        skill3TargetActionable
    );

    let className: string;
    if (!enabled) {
        className = `${StyleClassPrefix}-root ${StyleClassPrefix}-disabled`;
    } else {
        className = clsx(
            `${StyleClassPrefix}-root`,
            !skill1TargetActionable && `${StyleClassPrefix}-skill1-disabled`,
            !skill2TargetActionable && `${StyleClassPrefix}-skill2-disabled`,
            !skill3TargetActionable && `${StyleClassPrefix}-skill3-disabled`,
        );
    }

    return (
        <div className={className}>
            <ServantSkillLevel
                className={`${StyleClassPrefix}-current`}
                condensed
                icon={enabled ? skillSet : 'disabled'}
                skills={currentSkills}
            />
            {arrowCharacter}
            <ServantSkillLevel
                className={`${StyleClassPrefix}-target`}
                condensed
                skills={targetSkills}
            />
        </div>
    );

};
