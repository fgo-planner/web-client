import { Link, makeStyles, StyleRules, Theme, Tooltip } from '@material-ui/core';
import { ClassNameMap, WithStylesOptions } from '@material-ui/styles';
import clsx from 'clsx';
import React, { Fragment, ReactNode, useCallback, useEffect, useState } from 'react';
import { GameItemThumbnail } from '../../../../components/game/item/game-item-thumbnail.component';
import { GameServantBondIcon } from '../../../../components/game/servant/game-servant-bond-icon.component';
import { GameServantClassIcon } from '../../../../components/game/servant/game-servant-class-icon.component';
import { DataPointListItem } from '../../../../components/list/data-point-list-item.component';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { GameItemMap } from '../../../../services/data/game/game-item.service';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { GameServant, MasterServant, MasterServantBondLevel } from '../../../../types';
import { MasterPlanComputationUtils, ResultType1 } from '../../../../utils/master/master-plan-computation.utils';
import { MasterServantUtils } from '../../../../utils/master/master-servant.utils';
import { MasterServantEditForm, SubmitData } from '../../components/master/servant/edit-form/master-servant-edit-form.component';

type Props = {
    activeServant: MasterServant | undefined; // Not optional, but can be undefined.
    bondLevels: Record<number, MasterServantBondLevel | undefined>;
    unlockedCostumes: Array<number>;
    editMode?: boolean;
    onStatsChange?: (data: SubmitData) => void;
};

const FormId = 'master-servant-info-panel-form';

const renderServantName = (classes: ClassNameMap, servant: Readonly<GameServant> | undefined): ReactNode => {
    if (!servant) {
        return (
            <div className={classes.title}>
                Unknown Servant
            </div>
        );
    }
    return (
        <div className={classes.title}>
            <div className={clsx(classes.servantName, 'truncate')}>
                {servant.name}
            </div>
            <div className={classes.rarityClassIcon}>
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
};

const renderFouLevels = (classes: ClassNameMap, activeServant: Readonly<MasterServant>): JSX.Element => {
    const { fouAtk, fouHp } = activeServant;
    return (
        <div className={classes.skillLevelStat}>
            {fouHp ?? '\u2014'}
            <div className={classes.servantStatsDelimiter}>/</div>
            {fouAtk ?? '\u2014'}
        </div>
    );
};

const renderSkillLevels = (classes: ClassNameMap, activeServant: Readonly<MasterServant>): JSX.Element => {
    return (
        <div className={classes.skillLevelStat}>
            {activeServant.skills[1] ?? '\u2013'}
            <div className={classes.servantStatsDelimiter}>/</div>
            {activeServant.skills[2] ?? '\u2013'}
            <div className={classes.servantStatsDelimiter}>/</div>
            {activeServant.skills[3] ?? '\u2013'}
        </div>
    );
};

const renderBondLevel = (classes: ClassNameMap, bond?: MasterServantBondLevel): JSX.Element => {
    if (bond == null) {
        return (
            <div className={classes.bondLevelStat}>
                {'\u2014'}
            </div>
        );
    }
    return (
        <div className={classes.bondLevelStat}>
            <GameServantBondIcon bond={bond} size={24} />
            <div className="pl-1">{bond}</div>
        </div>
    );
};

const renderServantMaterialStatList = (
    classes: ClassNameMap,
    gameItemMap: GameItemMap,
    servantMaterialStatEntries: Array<[string, ResultType1]>
): ReactNode => {
    return servantMaterialStatEntries.map(([key, stats]): ReactNode => {
        const labelWidth = '80%'; // TODO Make this a constant
        const itemId = Number(key);
        const item = gameItemMap[itemId];
        const { ascensions, skills, costumes, total } = stats;
        const label = (
            <div className={classes.materialStatLabel}>
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
                        className={classes.materialStat}
                        label={label}
                        labelWidth={labelWidth}
                        value={stats.total}
                    />
                </div>
            </Tooltip>
        );
    });
};

const renderServantMaterialStats = (
    classes: ClassNameMap,
    gameItemMap: GameItemMap | undefined,
    servantMaterialStats: Record<number, ResultType1> | undefined
): ReactNode => {

    if (!servantMaterialStats || !gameItemMap) {
        return null;
    }

    const servantMaterialStatEntries = Object.entries(servantMaterialStats);
    let servantMaterialList: ReactNode;
    if (servantMaterialStatEntries.length) {
        servantMaterialList = renderServantMaterialStatList(classes, gameItemMap, servantMaterialStatEntries);
    } else {
        servantMaterialList = (
            <div className={classes.helperText}>
                Servant is fully upgraded
            </div>
        );
    }

    return (
        <div className={classes.materialStatsContainer}>
            <div className={classes.sectionTitle}>
                Materials Needed
            </div>
            <div className={classes.materialStatsList}> 
                {servantMaterialList}
            </div>
        </div>
    );
};

const renderServantLinks = (
    classes: ClassNameMap,
    servant: Readonly<GameServant> | undefined
): ReactNode => {
    const links = servant?.metadata.links;
    if (!links?.length) {
        return null;
    }
    return (
        <div className={classes.externalLinksContainer}>
            <div className={classes.sectionTitle}>
                Links
            </div>
            {links.map(({label, url}, index) => (
                <div className={classes.externalLink}>
                    <Link key={index} color="secondary" href={url} target="_blank">
                        {label}
                    </Link>
                </div>
            ))}
        </div>
    );
};

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    title: {
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing(4, 6)
    },
    sectionTitle: {
        fontSize: '0.875rem',
        fontWeight: 500,
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        padding: theme.spacing(1, 0)
    },
    helperText: {
        fontSize: '0.875rem',
        color: theme.palette.text.secondary,
        fontStyle: 'italic',
        lineHeight: '32px'
    },
    servantName: {
        fontSize: '1.125rem',
        fontWeight: 500,
        fontFamily: ThemeConstants.FontFamilyGoogleSans
    },
    rarityClassIcon: {
        minWidth: 56,
        paddingLeft: theme.spacing(2),
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: 'space-between'
    },
    scrollContainer: {
        overflowY: 'auto',
        height: '100%'
    },
    formContainer: {
        padding: theme.spacing(4)
    },
    servantStatsContainer: {
        padding: theme.spacing(2, 6, 4, 6)
    },
    servantStat: {
        justifyContent: 'space-between',
    },
    servantStatsDelimiter: {
        width: '1rem'
    },
    skillLevelStat: {
        display: 'flex',
        textAlign: 'center',
        alignItems: 'center',
    },
    bondLevelStat: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: theme.palette.divider,
    },
    materialStatsContainer: {
        paddingBottom: theme.spacing(4)
    },
    materialStatsList: {
        paddingTop: theme.spacing(2)
    },
    materialStat: {
        cursor: 'default',
        justifyContent: 'space-between',
        marginLeft: theme.spacing(-1)
    },
    materialStatLabel: {
        display: 'flex',
        alignItems: 'center'
    },
    externalLinksContainer: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(6)
    },
    externalLink: {
        fontSize: '0.875rem',
        paddingTop: theme.spacing(2)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantInfoPanel'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterServantInfoPanel = React.memo((props: Props) => {

    const {
        activeServant,
        bondLevels,
        unlockedCostumes,
        editMode,
        onStatsChange
    } = props;

    const classes = useStyles();

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
            const servantMaterialStats = MasterPlanComputationUtils.computeMaterialDebtForServant(servant, activeServant, unlockedCostumes);
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
        const servantMaterialStats = MasterPlanComputationUtils.computeMaterialDebtForServant(servant, activeServant, unlockedCostumes);
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

    if (!gameServantMap) {
        return null;
    }

    if (!activeServant) {
        return (
            <div className={clsx(classes.helperText, 'px-6 py-4')}>
                No servant selected
            </div>
        );
    }

    let servantStats: ReactNode;
    if (editMode) {
        servantStats = (<div className={classes.formContainer}>
            <MasterServantEditForm
                formId={FormId}
                masterServant={activeServant}
                bondLevels={bondLevels}
                unlockedCostumes={unlockedCostumes}
                onStatsChange={handleStatsChange}
                layout="panel"
            />
        </div>
        );
    } else {
        const labelWidth = '60%'; // TODO Make this a constant
        servantStats = (
            <div className={classes.servantStatsContainer}>
                <DataPointListItem
                    className={classes.servantStat}
                    label="Level"
                    labelWidth={labelWidth}
                    value={activeServant.level}
                />
                <DataPointListItem
                    className={classes.servantStat}
                    label="Ascension"
                    labelWidth={labelWidth}
                    value={activeServant.ascension}
                />
                <DataPointListItem
                    className={classes.servantStat}
                    label="Fou (HP/ATK)"
                    labelWidth={labelWidth}
                    value={renderFouLevels(classes, activeServant)}
                />
                <DataPointListItem
                    className={classes.servantStat}
                    label="Skills"
                    labelWidth={labelWidth}
                    value={renderSkillLevels(classes, activeServant)}
                />
                <DataPointListItem
                    className={classes.servantStat}
                    label="Noble Phantasm"
                    labelWidth={labelWidth}
                    value={activeServant.np}
                />
                <DataPointListItem
                    className={classes.servantStat}
                    label="Bond"
                    labelWidth={labelWidth}
                    value={renderBondLevel(classes, bondLevels[activeServant.gameId])}
                />
            </div>
        );
    }

    return (
        <div className={classes.root}>
            {renderServantName(classes, servant)}
            <div className={classes.scrollContainer}>
                {servantStats}
                <div className={classes.divider} />
                <div className="px-6 pt-4">
                    {renderServantMaterialStats(classes, gameItemMap, servantMaterialStats)}
                    {renderServantLinks(classes, servant)}
                </div>
            </div>
        </div>
    );
});
