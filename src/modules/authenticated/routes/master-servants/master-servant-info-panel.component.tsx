import { GameServant, MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { Link, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { Fragment, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { GameItemThumbnail } from '../../../../components/game/item/game-item-thumbnail.component';
import { GameServantBondIcon } from '../../../../components/game/servant/game-servant-bond-icon.component';
import { GameServantClassIcon } from '../../../../components/game/servant/game-servant-class-icon.component';
import { DataPointListItem } from '../../../../components/list/data-point-list-item.component';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { MasterServantUtils } from '../../../../utils/master/master-servant.utils';
import { PlannerComputationUtils, ResultType1 } from '../../../../utils/planner/planner-computation.utils';
import { MasterServantEditForm, SubmitData } from '../../components/master/servant/edit-form/master-servant-edit-form.component';

type Props = {
    activeServant: MasterServant | undefined; // Not optional, but can be undefined.
    bondLevels: Record<number, MasterServantBondLevel | undefined>;
    unlockedCostumes: Array<number>;
    editMode?: boolean;
    onStatsChange?: (data: SubmitData) => void;
};

const FormId = 'master-servant-info-panel-form';

const StyleClassPrefix = 'MasterServantInfoPanel';

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

const renderSkillLevels = (activeServant: Readonly<MasterServant>): JSX.Element => {
    const { skills } = activeServant;
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

const renderServantLinks = (servant: Readonly<GameServant> | undefined): ReactNode => {
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
};

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
        height: '100%'
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
        activeServant,
        bondLevels,
        unlockedCostumes,
        editMode,
        onStatsChange
    } = props;

    const gameItemMap = useGameItemMap();
    const gameServantMap = useGameServantMap();

    const [servant, setServant] = useState<Readonly<GameServant>>();
    const [servantMaterialStats, setServantMaterialStats] = useState<Record<number, ResultType1>>();

    useEffect(() => {
        if (!gameServantMap || !activeServant) {
            setServant(undefined);
            setServantMaterialStats(undefined);
        } else {
            const servant = gameServantMap[activeServant.gameId];
            const servantMaterialStats = PlannerComputationUtils.computeMaterialDebtForServant(servant, activeServant, unlockedCostumes);
            setServant(servant);
            setServantMaterialStats(servantMaterialStats);
        }
    }, [gameServantMap, activeServant, unlockedCostumes]);

    const handleStatsChange = useCallback((data: SubmitData): void => {
        if (!editMode || !gameServantMap || !activeServant) {
            return;
        }
        /*
         * Update data from the form
         */
        MasterServantUtils.merge(activeServant, data.masterServant);
        bondLevels[activeServant.gameId] = data.bond;
        // TODO Update unlocked costumes

        /*
         * Re-compute servant material stats
         */
        const servant = gameServantMap[activeServant.gameId];
        const servantMaterialStats = PlannerComputationUtils.computeMaterialDebtForServant(servant, activeServant, unlockedCostumes);
        setServantMaterialStats(servantMaterialStats);

        onStatsChange && onStatsChange(data);
    }, [
        gameServantMap,
        activeServant,
        bondLevels,
        unlockedCostumes,
        editMode,
        onStatsChange
    ]);

    const servantNameNode = useMemo(() => {
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
    }, [servant]);

    const servantStatsNode: ReactNode = useMemo(() => {
        if (!activeServant) {
            return null;
        }
        if (editMode) {
            return (
                <MasterServantEditForm
                    formId={FormId}
                    className="p-4"
                    masterServant={activeServant}
                    bondLevels={bondLevels}
                    unlockedCostumes={unlockedCostumes}
                    onStatsChange={handleStatsChange}
                    layout="panel"
                />
            );
        } else {
            const labelWidth = '60%'; // TODO Make this a constant
            return (
                <div className={`${StyleClassPrefix}-servant-stats-container`}>
                    <DataPointListItem
                        className={`${StyleClassPrefix}-servant-stat`}
                        label="Level"
                        labelWidth={labelWidth}
                        value={activeServant.level}
                    />
                    <DataPointListItem
                        className={`${StyleClassPrefix}-servant-stat`}
                        label="Ascension"
                        labelWidth={labelWidth}
                        value={activeServant.ascension}
                    />
                    <DataPointListItem
                        className={`${StyleClassPrefix}-servant-stat`}
                        label="Fou (HP/ATK)"
                        labelWidth={labelWidth}
                        value={renderFouLevels(activeServant)}
                    />
                    <DataPointListItem
                        className={`${StyleClassPrefix}-servant-stat`}
                        label="Skills"
                        labelWidth={labelWidth}
                        value={renderSkillLevels(activeServant)}
                    />
                    <DataPointListItem
                        className={`${StyleClassPrefix}-servant-stat`}
                        label="Noble Phantasm"
                        labelWidth={labelWidth}
                        value={activeServant.np}
                    />
                    <DataPointListItem
                        className={`${StyleClassPrefix}-servant-stat`}
                        label="Bond"
                        labelWidth={labelWidth}
                        value={renderBondLevel(bondLevels[activeServant.gameId])}
                    />
                </div>
            );
        }
    }, [
        activeServant,
        bondLevels,
        editMode,
        handleStatsChange,
        unlockedCostumes
    ]);

    const servantMaterialStatsNode: ReactNode = useMemo(() => {
        if (!servantMaterialStats || !gameItemMap) {
            return null;
        }

        const servantMaterialStatEntries = Object.entries(servantMaterialStats);
        let servantMaterialList: ReactNode;
        if (servantMaterialStatEntries.length) {
            const labelWidth = '80%'; // TODO Make this a constant
            servantMaterialList = servantMaterialStatEntries.map(([key, stats]): ReactNode => {
                const itemId = Number(key);
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
                                labelWidth={labelWidth}
                                value={stats.total}
                            />
                        </div>
                    </Tooltip>
                );
            });
        } else {
            servantMaterialList = (
                <div className={`${StyleClassPrefix}-helper-text`}>
                    Servant is fully upgraded
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
    }, [gameItemMap, servantMaterialStats]);

    if (!activeServant) {
        return (
            // FIXME Inline sx prop
            <Box className={`${StyleClassPrefix}-helper-text`} sx={{ px: 6, py: 4 }}>
                No servant selected
            </Box>
        );
    }

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {servantNameNode}
            <div className={`${StyleClassPrefix}-scroll-container`}>
                {servantStatsNode}
                <div className={`${StyleClassPrefix}-divider`} />
                {/* FIXME Inline sx prop */}
                <Box sx={{ px: 6, pt: 4 }}>
                    {servantMaterialStatsNode}
                    {renderServantLinks(servant)}
                </Box>
            </div>
        </Box>
    );
});
