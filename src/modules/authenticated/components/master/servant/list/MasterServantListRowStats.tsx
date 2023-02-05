import { ObjectUtils } from '@fgo-planner/common-core';
import { ImmutableMasterServant, InstantiatedServantBondLevel } from '@fgo-planner/data-core';
import React, { DOMAttributes } from 'react';
import { ServantSkillLevel } from '../../../../../../components/servant/ServantSkillLevels';
import { MasterServantListRowBondLevel } from './MasterServantListRowBondLevel';
import { MasterServantListRowFouLevel } from './MasterServantListRowFouLevel';
import { MasterServantListRowLevel } from './MasterServantListRowLevel';
import { MasterServantListRowNpLevel } from './MasterServantListRowNpLevel';
import { MasterServantListColumn } from './MasterServantListColumn';
import { MasterServantListRowSummonDate } from './MasterServantListRowSummonDate';

type Props = {
    active?: boolean;
    bond: InstantiatedServantBondLevel | undefined;
    masterServant: ImmutableMasterServant;
    visibleColumns?: Readonly<MasterServantListColumn.Visibility>;
} & Omit<DOMAttributes<HTMLDivElement>, 'onClick' | 'onContextMenu'>;

const shouldSkipUpdate = (prevProps: Readonly<Props>, nextProps: Readonly<Props>): boolean => {
    if (!ObjectUtils.isShallowEquals(prevProps, nextProps)) {
        return false;
    }
    // Always re-render active servant rows.
    return !nextProps.active;
};

export const StyleClassPrefix = 'MasterServantListRowStats';

export const MasterServantListRowStats = React.memo((props: Props) => {

    const {
        bond,
        masterServant,
        visibleColumns
    } = props;

    const {
        npLevel,
        level,
        fouHp,
        fouAtk,
        skills,
        appendSkills,
        bondLevel,
        summonDate
    } = visibleColumns || {};

    return (
        <div className={`${StyleClassPrefix}-root`}>
            {npLevel && <MasterServantListRowNpLevel masterServant={masterServant} />}
            {level && <MasterServantListRowLevel masterServant={masterServant} />}
            {fouHp && <MasterServantListRowFouLevel fouLevel={masterServant.fouHp} />}
            {fouAtk && <MasterServantListRowFouLevel fouLevel={masterServant.fouAtk} />}
            {skills && <ServantSkillLevel skills={masterServant.skills} icon='skills' />}
            {appendSkills && <ServantSkillLevel skills={masterServant.appendSkills} icon='appendSkills' />}
            {bondLevel && <MasterServantListRowBondLevel bondLevel={bond} />}
            {summonDate && <MasterServantListRowSummonDate date={masterServant.summonDate} />}
        </div>
    );

}, shouldSkipUpdate);
