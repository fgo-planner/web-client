import { MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { Link, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { Fragment, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { GameItemThumbnail } from '../../../../components/game/item/game-item-thumbnail.component';
import { GameServantBondIcon } from '../../../../components/game/servant/game-servant-bond-icon.component';
import { GameServantClassIcon } from '../../../../components/game/servant/game-servant-class-icon.component';
import { DataPointListItem } from '../../../../components/list/data-point-list-item.component';
import { GameItemConstants } from '../../../../constants';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { MasterServantUtils } from '../../../../utils/master/master-servant.utils';
import { MaterialDebtMap, PlanComputationUtils } from '../../../../utils/plan/plan-computation.utils';
import { MasterServantEditForm, SubmitData } from '../../components/master/servant/edit-form/master-servant-edit-form.component';

type Props = {
    activeServants: Array<MasterServant>;
    bondLevels: Record<number, MasterServantBondLevel>;
    unlockedCostumes: Array<number>;
    showAppendSkills?: boolean;
    editMode?: boolean;
    onStatsChange?: (data: SubmitData) => void;
};

const FormId = 'master-servant-info-panel-form';

const hasDebt = (materialDebtMap: MaterialDebtMap): boolean => {
    return materialDebtMap[GameItemConstants.QpItemId].total !== 0;
};

const renderFouLevels = (activeServant: Readonly<MasterServant>): JSX.Element => {
    const { fouAtk, fouHp } = activeServant;
    return (
        <div className={`${StyleClassPrefix}-skill-level-stat`}>
            {fouHp ?? '\u2014'}
            <div className={`${StyleClassPrefix}-servant-stats-delimiter`}>/</div>
            {fouAtk ?? '\u2014'}
        </div>
    );
};

const renderSkillLevels = (activeServant: Readonly<MasterServant>, stat: 'skills' | 'appendSkills'): JSX.Element => {
    const skills = activeServant[stat];
    return (
        <div className={`${StyleClassPrefix}-skill-level-stat`}>
            {skills[1] ?? '\u2013'}
            <div className={`${StyleClassPrefix}-servant-stats-delimiter`}>/</div>
            {skills[2] ?? '\u2013'}
            <div className={`${StyleClassPrefix}-servant-stats-delimiter`}>/</div>
            {skills[3] ?? '\u2013'}
        </div>
    );
};

const renderBondLevel = (bond?: MasterServantBondLevel): JSX.Element => {
    if (bond == null) {
        return (
            <div className={`${StyleClassPrefix}-bond-level-stat`}>
                {'\u2014'}
            </div>
        );
    }
    return (
        <div className={`${StyleClassPrefix}-bond-level-stat`}>
            <GameServantBondIcon bond={bond} size={24} />
            <div className="pl-1">{bond}</div>
        </div>
    );
};

const ServantStatLabelWidth = '60%';

const MaterialLabelWidth = '80%';

const StyleClassPrefix = 'MasterServantInfoPanel';

const StyleProps = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    [`& .${StyleClassPrefix}-title`]: {
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 6,
        py: 4
    },
    [`& .${StyleClassPrefix}-section-title`]: {
        fontSize: '0.875rem',
        fontWeight: 500,
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        py: 1
    },
    [`& .${StyleClassPrefix}-helper-text`]: {
        fontSize: '0.875rem',
        color: 'text.secondary',
        fontStyle: 'italic',
        lineHeight: '32px'
    },
    [`& .${StyleClassPrefix}-servant-name`]: {
        fontSize: '1.125rem',
        fontWeight: 500,
        fontFamily: ThemeConstants.FontFamilyGoogleSans
    },
    [`& .${StyleClassPrefix}-rarity-class-icon`]: {
        minWidth: 56,
        pl: 2,
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: 'space-between'
    },
    [`& .${StyleClassPrefix}-scroll-container`]: {
        overflowY: 'auto',
        height: '100%',
        '>:last-child': {
            px: 6,
            pt: 4
        }
    },
    [`& .${StyleClassPrefix}-servant-stats-container`]: {
        px: 6,
        pt: 2,
        pb: 4
    },
    [`& .${StyleClassPrefix}-servant-stat`]: {
        justifyContent: 'space-between',
    },
    [`& .${StyleClassPrefix}-servant-stats-delimiter`]: {
        width: '1rem'
    },
    [`& .${StyleClassPrefix}-skill-level-stat`]: {
        display: 'flex',
        textAlign: 'center',
        alignItems: 'center',
    },
    [`& .${StyleClassPrefix}-bond-level-stat`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    [`& .${StyleClassPrefix}-divider`]: {
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
    },
    [`& .${StyleClassPrefix}-material-stats-container`]: {
        pb: 4
    },
    [`& .${StyleClassPrefix}-material-stats-list`]: {
        pt: 2
    },
    [`& .${StyleClassPrefix}-material-stat`]: {
        cursor: 'default',
        justifyContent: 'space-between',
        ml: -1
    },
    [`& .${StyleClassPrefix}-material-stat-label`]: {
        display: 'flex',
        alignItems: 'center'
    },
    [`& .${StyleClassPrefix}-external-links-container`]: {
        pt: 2,
        pb: 6
    },
    [`& .${StyleClassPrefix}-external-link`]: {
        fontSize: '0.875rem',
        pt: 2
    }
} as SystemStyleObject<Theme>;

export const MasterServantInfoPanel = React.memo((props: Props) => {

    const {
        activeServants,
        bondLevels,
        unlockedCostumes,
        showAppendSkills,
        editMode,
        onStatsChange
    } = props;

    const gameItemMap = useGameItemMap();
    const gameServantMap = useGameServantMap();

    const [selectedServantsMaterialDebt, setSelectedServantsMaterialDebt] = useState<MaterialDebtMap>();

    useEffect(() => {
        if (!gameServantMap || !activeServants.length) {
            setSelectedServantsMaterialDebt(undefined);
        } else {
            const selectedServantsMaterialDebt: MaterialDebtMap = {};
            for (const activeServant of activeServants) {
                const servant = gameServantMap[activeServant.gameId];
                if (!servant) {
                    continue;
                }
                const servantMaterialDebt = PlanComputationUtils.computeMaterialDebtForServant(
                    servant,
                    activeServant,
                    unlockedCostumes,
                    !!showAppendSkills,
                    false // TODO Add prop to toggle lores.
                );
                PlanComputationUtils.addMaterialDebtMap(servantMaterialDebt, selectedServantsMaterialDebt);
            }
            // TODO Add way to toggle lores
            setSelectedServantsMaterialDebt(selectedServantsMaterialDebt);
        }
    }, [activeServants, gameServantMap, showAppendSkills, unlockedCostumes]);

    const handleStatsChange = useCallback((data: SubmitData): void => {
        if (!editMode || !gameServantMap || activeServants.length !== 1) {
            return;
        }
        const activeServant = activeServants[0];
        const { gameId } = activeServant;
        /*
         * Update data from the form. Note that `data.masterServant` does not contain an
         * `instanceId` value, but it should not affect the `merge` method; we just need
         * to typecast to `any` to bypass the type check error.
         */
        MasterServantUtils.merge(activeServant, data.masterServant as any);
        if (data.bond === undefined) {
            delete bondLevels[gameId];
        } else {
            bondLevels[gameId] = data.bond;
        }
        // TODO Update unlocked costumes

        /*
         * Re-compute servant material stats. Only one servant should be active at this
         * point.
         */
        const servant = gameServantMap[gameId];
        if (servant) {
            const servantMaterialDebt = PlanComputationUtils.computeMaterialDebtForServant(
                servant,
                activeServant,
                unlockedCostumes,
                !!showAppendSkills,
                false // TODO Add prop to toggle lores.
            );
            setSelectedServantsMaterialDebt(servantMaterialDebt);
        }

        onStatsChange && onStatsChange(data);
    }, [activeServants, bondLevels, editMode, gameServantMap, onStatsChange, showAppendSkills, unlockedCostumes]);

    const servantNameNode: ReactNode = useMemo(() => {
        if (activeServants.length !== 1) {
            return (
                <div className={`${StyleClassPrefix}-title`}>
                    {!activeServants.length ? 'No servant selected' : 'Multiple servants selected'}
                </div>
            );
        }
        const activeServant = activeServants[0];
        const servant = gameServantMap?.[activeServant.gameId];
        if (!servant) {
            return (
                <div className={`${StyleClassPrefix}-title`}>
                    Unknown Servant
                </div>
            );
        }
        return (
            <div className={`${StyleClassPrefix}-title`}>
                <div className={clsx(`${StyleClassPrefix}-servant-name`, 'truncate')}>
                    {servant.name}
                </div>
                <div className={`${StyleClassPrefix}-rarity-class-icon`}>
                    <div>
                        {`${servant.rarity} \u2605`}
                    </div>
                    <GameServantClassIcon
                        servantClass={servant.class}
                        rarity={servant.rarity}
                    />
                </div>
            </div>
        );
    }, [activeServants, gameServantMap]);

    const servantStatsNode: ReactNode = useMemo(() => {
        if (activeServants.length !== 1) {
            return null;
        }
        const activeServant = activeServants[0];
        if (editMode) {
            return (
                <MasterServantEditForm
                    formId={FormId}
                    className="p-4"
                    masterServant={activeServant}
                    bondLevels={bondLevels}
                    unlockedCostumes={unlockedCostumes}
                    showAppendSkills={showAppendSkills}
                    onStatsChange={handleStatsChange}
                    layout="panel"
                />
            );
        } else {
            return (
                <div className={`${StyleClassPrefix}-servant-stats-container`}>
                    <DataPointListItem
                        className={`${StyleClassPrefix}-servant-stat`}
                        label="Level"
                        labelWidth={ServantStatLabelWidth}
                        value={activeServant.level}
                    />
                    <DataPointListItem
                        className={`${StyleClassPrefix}-servant-stat`}
                        label="Ascension"
                        labelWidth={ServantStatLabelWidth}
                        value={activeServant.ascension}
                    />
                    <DataPointListItem
                        className={`${StyleClassPrefix}-servant-stat`}
                        label="Fou (HP/ATK)"
                        labelWidth={ServantStatLabelWidth}
                        value={renderFouLevels(activeServant)}
                    />
                    <DataPointListItem
                        className={`${StyleClassPrefix}-servant-stat`}
                        label="Skills"
                        labelWidth={ServantStatLabelWidth}
                        value={renderSkillLevels(activeServant, 'skills')}
                    />
                    {showAppendSkills &&
                        <DataPointListItem
                            className={`${StyleClassPrefix}-servant-stat`}
                            label="Append Skills"
                            labelWidth={ServantStatLabelWidth}
                            value={renderSkillLevels(activeServant, 'appendSkills')}
                        />
                    }
                    <DataPointListItem
                        className={`${StyleClassPrefix}-servant-stat`}
                        label="Noble Phantasm"
                        labelWidth={ServantStatLabelWidth}
                        value={activeServant.np}
                    />
                    <DataPointListItem
                        className={`${StyleClassPrefix}-servant-stat`}
                        label="Bond"
                        labelWidth={ServantStatLabelWidth}
                        value={renderBondLevel(bondLevels[activeServant.gameId])}
                    />
                </div>
            );
        }
    }, [activeServants, bondLevels, editMode, handleStatsChange, showAppendSkills, unlockedCostumes]);

    const servantMaterialDebtNode: ReactNode = useMemo(() => {
        if (!selectedServantsMaterialDebt || !gameItemMap) {
            return null;
        }

        let servantMaterialList: ReactNode;
        if (hasDebt(selectedServantsMaterialDebt)) {

            const servantMaterialStatEntries = Object.entries(selectedServantsMaterialDebt);
            servantMaterialList = servantMaterialStatEntries.map(([key, stats]): ReactNode => {
                const itemId = Number(key);
                /*
                 * Do not display QP in the panel...
                 */
                if (itemId === GameItemConstants.QpItemId) {
                    return null;
                }

                const item = gameItemMap[itemId];
                const { ascensions, skills, appendSkills, costumes, total } = stats;

                const label = (
                    <div className={`${StyleClassPrefix}-material-stat-label`}>
                        <GameItemThumbnail item={item} size={24} />
                        <div className="pl-2 truncate">
                            {item.name}
                        </div>
                    </div>
                );

                const tooltip = (
                    <Fragment>
                        <div>{item.name}</div>
                        {!!ascensions && <div>Ascensions: {ascensions}</div>}
                        {!!skills && <div>Skills: {skills}</div>}
                        {!!appendSkills && <div>Append skills: {appendSkills}</div>}
                        {!!costumes && <div>Costumes: {costumes}</div>}
                        <div>Total: {total}</div>
                    </Fragment>
                );

                return (
                    <Tooltip
                        key={itemId}
                        title={tooltip}
                        placement="left-start"
                        enterDelay={250}
                    >
                        <div>
                            <DataPointListItem
                                className={`${StyleClassPrefix}-material-stat`}
                                label={label}
                                labelWidth={MaterialLabelWidth}
                                value={stats.total}
                            />
                        </div>
                    </Tooltip>
                );
            });
        } else {
            servantMaterialList = (
                <div className={`${StyleClassPrefix}-helper-text`}>
                    Servant is fully enhanced
                </div>
            );
        }

        return (
            <div className={`${StyleClassPrefix}-material-stats-container`}>
                <div className={`${StyleClassPrefix}-section-title`}>
                    Materials Needed
                </div>
                <div className={`${StyleClassPrefix}-material-stats-list`}>
                    {servantMaterialList}
                </div>
            </div>
        );
    }, [gameItemMap, selectedServantsMaterialDebt]);

    const servantLinksNode: ReactNode = useMemo(() => {
        if (activeServants.length !== 1) {
            return null;
        }
        const activeServant = activeServants[0];
        const servant = gameServantMap?.[activeServant.gameId];
        const links = servant?.metadata.links;
        if (!links?.length) {
            return null;
        }
        return (
            <div className={`${StyleClassPrefix}-external-links-container`}>
                <div className={`${StyleClassPrefix}-section-title`}>
                    Links
                </div>
                {links.map(({ label, url }, index) => (
                    <div className={`${StyleClassPrefix}-external-link`}>
                        <Link key={index} color="secondary" href={url} target="_blank">
                            {label}
                        </Link>
                    </div>
                ))}
            </div>
        );
    }, [activeServants, gameServantMap]);

    const scrollContainerNode: ReactNode = useMemo(() => {
        if (!servantMaterialDebtNode) {
            return null;
        }
        return (
            <div className={`${StyleClassPrefix}-scroll-container`}>
                {servantStatsNode}
                <div className={`${StyleClassPrefix}-divider`} />
                <div>
                    {servantMaterialDebtNode}
                    {servantLinksNode}
                </div>
            </div>
        );
    }, [servantLinksNode, servantMaterialDebtNode, servantStatsNode]);

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {servantNameNode}
            {scrollContainerNode}
        </Box>
    );
});
