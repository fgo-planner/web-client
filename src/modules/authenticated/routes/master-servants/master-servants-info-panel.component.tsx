import { GameServantClass, MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { IconButton, Link, Theme, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { Fragment, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { GameItemThumbnail } from '../../../../components/game/item/game-item-thumbnail.component';
import { GameServantBondIcon } from '../../../../components/game/servant/game-servant-bond-icon.component';
import { DataPointListItem } from '../../../../components/list/data-point-list-item.component';
import { GameServantConstants } from '../../../../constants';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { PlanEnhancementRequirements as EnhancementRequirements } from '../../../../types/data';
import { Immutable } from '../../../../types/internal';
import { ComputationOptions, PlanComputationUtils } from '../../../../utils/plan/plan-computation.utils';

type Props = {
    activeServants: Array<MasterServant>;
    bondLevels: Record<number, MasterServantBondLevel>;
    editMode?: boolean;
    keepChildrenMounted?: boolean;
    onOpenToggle: () => void;
    onStatsChange?: (data: any) => void;
    open?: boolean;
    statsOptions?: ComputationOptions;
    unlockedCostumes: Array<number>;
};

// const FormId = 'master-servant-info-panel-form';

const hasDebt = (enhancementRequirements: EnhancementRequirements): boolean => {
    return enhancementRequirements.qp > 0;
};

const renderFouLevels = (activeServant: Immutable<MasterServant>): JSX.Element => {
    const { fouAtk, fouHp } = activeServant;
    return (
        <div className={`${StyleClassPrefix}-skill-level-stat`}>
            {fouHp ?? '\u2014'}
            <div className={`${StyleClassPrefix}-servant-stats-delimiter`}>/</div>
            {fouAtk ?? '\u2014'}
        </div>
    );
};

const renderSkillLevels = (activeServant: Immutable<MasterServant>, stat: 'skills' | 'appendSkills'): JSX.Element => {
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

const renderNpLevel = (activeServant: Immutable<MasterServant>): string | number => {
    const { summoned, np: npLevel } = activeServant;
    return summoned ? npLevel : 'Not summoned';
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
            <div className='pl-1'>{bond}</div>
        </div>
    );
};

const ServantStatLabelWidth = '60%';

const MaterialLabelWidth = '80%';

const StyleClassPrefix = 'MasterServantInfoPanel';

const StyleProps = (theme: SystemTheme) => {

    const {
        palette,
        breakpoints,
        spacing
    } = theme as Theme;

    return {
        // backgroundColor: palette.background.paper,
        width: spacing(90),  // 360px
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        [`& .${StyleClassPrefix}-actions-container`]: {
            // backgroundColor: palette.background.paper,
            display: 'flex',
            flexDirection: 'row-reverse',
            alignItems: 'center',
            justifyContent: 'flex-start',
            zIndex: 1,
            '&>div': {
                p: 1
            }
        },
        [`& .${StyleClassPrefix}-title`]: {
            backgroundColor: palette.background.paper,
            position: 'absolute',
            display: 'flex',
            flexWrap: 'nowrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            pl: 6,
            pr: 14,
            py: 4,
            boxSizing: 'border-box',
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
            }
        },
        [`& .${StyleClassPrefix}-section-title`]: {
            fontSize: '0.875rem',
            fontWeight: 500,
            fontFamily: ThemeConstants.FontFamilyGoogleSans,
            py: 1
        },
        [`& .${StyleClassPrefix}-helper-text`]: {
            fontSize: '0.875rem',
            color: palette.text.secondary,
            fontStyle: 'italic',
            lineHeight: '32px'
        },
        [`& .${StyleClassPrefix}-divider`]: {
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: palette.divider
        },
        [`& .${StyleClassPrefix}-scroll-container`]: {
            backgroundColor: palette.background.paper,
            overflowY: 'auto',
            '>:last-child': {
                px: 6,
                pt: 4
            },
            [`& .${StyleClassPrefix}-servant-stats-container`]: {
                px: 6,
                pt: 2,
                pb: 4,
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
                }
            },
            [`& .${StyleClassPrefix}-material-stats-container`]: {
                pb: 4,
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
                }
            },
            [`& .${StyleClassPrefix}-external-links-container`]: {
                pt: 2,
                pb: 6,
                [`& .${StyleClassPrefix}-external-link`]: {
                    fontSize: '0.875rem',
                    pt: 2
                }
            }
        },
        [breakpoints.down('xl')]: {
            width: spacing(80)  // 320px
        },
        [breakpoints.down('lg')]: {
            width: spacing(75)  // 300px
        },
        [`&:not(.${StyleClassPrefix}-open)`]: {
            width: spacing(14),  // 56px
            [`& .${StyleClassPrefix}-actions-container`]: {
                backgroundColor: 'initial',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                pt: 2
            },
            '&>:not(:first-of-type)': {
                display: 'none'
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterServantsInfoPanel = React.memo((props: Props) => {

    const {
        activeServants,
        bondLevels,
        editMode,
        keepChildrenMounted,
        onOpenToggle,
        onStatsChange,
        open,
        statsOptions,
        unlockedCostumes
    } = props;

    const gameItemMap = useGameItemMap();
    const gameServantMap = useGameServantMap();

    const [selectedServantsEnhancementRequirements, setSelectedServantsEnhancementRequirements] = useState<EnhancementRequirements>();

    const renderChildren = open || keepChildrenMounted;

    useEffect(() => {
        if (!gameServantMap || !renderChildren || !activeServants.length) {
            setSelectedServantsEnhancementRequirements(undefined);
        } else {
            const results = [];
            for (const activeServant of activeServants) {
                const servant = gameServantMap[activeServant.gameId];
                if (!servant) {
                    continue;
                }
                const result = PlanComputationUtils.computeServantEnhancementRequirements(
                    servant,
                    activeServant,
                    unlockedCostumes,
                    statsOptions
                );
                results.push(result);
            }
            setSelectedServantsEnhancementRequirements(PlanComputationUtils.sumEnhancementRequirements(results));
        }
    }, [activeServants, gameServantMap, renderChildren, statsOptions, unlockedCostumes]);

    /**
     * For edit mode, currently unused.
     */
    const handleStatsChange = useCallback((data: any): void => {
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
        // MasterServantUtils.merge(activeServant, data.masterServant as any);
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
            const result = PlanComputationUtils.computeServantEnhancementRequirements(
                servant,
                activeServant,
                unlockedCostumes,
                statsOptions
            );
            setSelectedServantsEnhancementRequirements(result);
        }

        onStatsChange && onStatsChange(data);
    }, [activeServants, bondLevels, editMode, gameServantMap, onStatsChange, statsOptions, unlockedCostumes]);

    const actionButtonsNode: ReactNode = (
        <div className={`${StyleClassPrefix}-actions-container`}>
            <div>
                <IconButton size='large' onClick={onOpenToggle}>
                    {open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </div>
            {/* Implement button to toggle edit mode */}
            {/* <div>
                <IconButton size='large'>
                    <EditIcon />
                </IconButton>
            </div> */}
        </div>
    );

    const servantNameNode: ReactNode = useMemo(() => {
        if (!renderChildren) {
            return null;
        }
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
            </div>
        );
    }, [activeServants, gameServantMap, renderChildren]);

    const servantStatsNode: ReactNode = useMemo(() => {
        if (!gameServantMap || !renderChildren || activeServants.length !== 1) {
            return null;
        }
        const activeServant = activeServants[0];
        const servant = gameServantMap[activeServant.gameId];
        // if (editMode) {
        //     return (
        //         <MasterServantEditForm
        //             formId={FormId}
        //             className='p-4'
        //             masterServant={activeServant}
        //             bondLevels={bondLevels}
        //             unlockedCostumes={unlockedCostumes}
        //             showAppendSkills={showAppendSkills}
        //             onStatsChange={handleStatsChange}
        //             layout='panel'
        //         />
        //     );
        // } else {
        return <>
            <div className={`${StyleClassPrefix}-servant-stats-container`}>
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Rarity'
                    labelWidth={ServantStatLabelWidth}
                    value={`${servant?.rarity || '\u2014'} \u2605`}
                />
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Class'
                    labelWidth={ServantStatLabelWidth}
                    value={GameServantConstants.ClassDisplayNameMap[servant?.class || GameServantClass.Unknown]}
                />
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Level'
                    labelWidth={ServantStatLabelWidth}
                    value={activeServant.level}
                />
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Ascension'
                    labelWidth={ServantStatLabelWidth}
                    value={activeServant.ascension}
                />
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Fou (HP/ATK)'
                    labelWidth={ServantStatLabelWidth}
                    value={renderFouLevels(activeServant)}
                />
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Skills'
                    labelWidth={ServantStatLabelWidth}
                    value={renderSkillLevels(activeServant, 'skills')}
                />
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Append Skills'
                    labelWidth={ServantStatLabelWidth}
                    value={renderSkillLevels(activeServant, 'appendSkills')}
                />
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Noble Phantasm'
                    labelWidth={ServantStatLabelWidth}
                    value={renderNpLevel(activeServant)}
                />
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Bond'
                    labelWidth={ServantStatLabelWidth}
                    value={renderBondLevel(bondLevels[activeServant.gameId])}
                />
            </div>
            <div className={`${StyleClassPrefix}-divider`} />
        </>;
        // }
    }, [activeServants, bondLevels, gameServantMap, renderChildren]);

    const servantMaterialDebtNode: ReactNode = useMemo(() => {
        if (!gameItemMap || !renderChildren || !selectedServantsEnhancementRequirements) {
            return null;
        }

        let materialRequirementsList: ReactNode;
        if (hasDebt(selectedServantsEnhancementRequirements)) {
            const materialRequirementsEntries = Object.entries(selectedServantsEnhancementRequirements.items);
            materialRequirementsList = materialRequirementsEntries.map(([key, requirements]): ReactNode => {

                const {
                    ascensions,
                    skills,
                    appendSkills,
                    costumes,
                    total
                } = requirements;

                const itemId = Number(key);
                const gameItem = gameItemMap[itemId];

                const label = (
                    <div className={`${StyleClassPrefix}-material-stat-label`}>
                        <GameItemThumbnail gameItem={gameItem} size={24} />
                        <div className='pl-2 truncate'>
                            {gameItem.name}
                        </div>
                    </div>
                );

                const tooltip = (
                    <Fragment>
                        <div>{gameItem.name}</div>
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
                        placement='left-start'
                        enterDelay={250}
                    >
                        <div>
                            <DataPointListItem
                                className={`${StyleClassPrefix}-material-stat`}
                                label={label}
                                labelWidth={MaterialLabelWidth}
                                value={requirements.total}
                            />
                        </div>
                    </Tooltip>
                );
            });
        } else {
            materialRequirementsList = (
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
                    {materialRequirementsList}
                </div>
            </div>
        );
    }, [gameItemMap, renderChildren, selectedServantsEnhancementRequirements]);

    const servantLinksNode: ReactNode = useMemo(() => {
        if (!renderChildren || activeServants.length !== 1) {
            return null;
        }
        const activeServant = activeServants[0];
        const servant = gameServantMap?.[activeServant.gameId];
        const links = servant?.metadata?.links;
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
                        <Link key={index} color='secondary' href={url} target='_blank'>
                            {label}
                        </Link>
                    </div>
                ))}
            </div>
        );
    }, [activeServants, gameServantMap, renderChildren]);

    const scrollContainerNode: ReactNode = useMemo(() => {
        if (!servantMaterialDebtNode) {
            return null;
        }
        return (
            <div className={`${StyleClassPrefix}-scroll-container`}>
                {servantStatsNode}
                <div>
                    {servantMaterialDebtNode}
                    {servantLinksNode}
                </div>
            </div>
        );
    }, [servantLinksNode, servantMaterialDebtNode, servantStatsNode]);

    const className = clsx(
        `${StyleClassPrefix}-root`,
        ThemeConstants.ClassScrollbarTrackBorder,
        open && `${StyleClassPrefix}-open`
    );

    return (
        <Box className={className} sx={StyleProps}>
            {actionButtonsNode}
            {servantNameNode}
            {scrollContainerNode}
            <div className={`${StyleClassPrefix}-divider`} />
        </Box>
    );

});
