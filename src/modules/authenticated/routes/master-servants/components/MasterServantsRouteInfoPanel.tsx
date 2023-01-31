import { ExternalLink, GameServantClass, GameServantConstants, ImmutableMasterServant, InstantiatedServantBondLevel, MasterServantAggregatedData } from '@fgo-planner/data-core';
import { Icon, IconButton, Link, Theme, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { Fragment, ReactNode, useEffect, useMemo, useState } from 'react';
import { DataPointListItem } from '../../../../../components/data-point-list/data-point-list-item.component';
import { ItemThumbnail } from '../../../../../components/item/ItemThumbnail';
import { ServantBondIcon } from '../../../../../components/servant/ServantBondIcon';
import { useGameItemMap } from '../../../../../hooks/data/useGameItemMap';
import { ThemeConstants } from '../../../../../styles/theme-constants';
import { PlanEnhancementRequirements as EnhancementRequirements } from '../../../../../types';
import { GameServantUtils } from '../../../../../utils/game/game-servant.utils';
import * as PlanComputationUtils from '../../../../../utils/plan/plan-computation.utils';

type Props = {
    activeServantsData: ReadonlyArray<MasterServantAggregatedData>;
    bondLevels: Record<number, InstantiatedServantBondLevel>;
    editMode?: boolean;
    keepChildrenMounted?: boolean;
    onOpenToggle: () => void;
    /**
     * @deprecated Needs to be reworked
     */
    onStatsChange?: (data: any) => void;
    open?: boolean;
    statsOptions?: PlanComputationUtils.ComputationOptions;
    unlockedCostumes: Iterable<number>;
};

const hasDebt = (enhancementRequirements: EnhancementRequirements): boolean => {
    return enhancementRequirements.qp > 0;
};

const renderFouLevels = (masterServant: ImmutableMasterServant): JSX.Element => {
    const { fouAtk, fouHp } = masterServant;
    return (
        <div className={`${StyleClassPrefix}-skill-level-stat`}>
            {fouHp ?? '\u2014'}
            <div className={`${StyleClassPrefix}-servant-stats-delimiter`}>/</div>
            {fouAtk ?? '\u2014'}
        </div>
    );
};

const renderSkillLevels = (masterServant: ImmutableMasterServant, stat: 'skills' | 'appendSkills'): JSX.Element => {
    const skills = masterServant[stat];
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

const renderNpLevel = (masterServant: ImmutableMasterServant): string | number => {
    return masterServant.summoned ? masterServant.np : 'Not summoned';
};

const renderBondLevel = (bond?: InstantiatedServantBondLevel): JSX.Element => {
    if (bond == null) {
        return (
            <div className={`${StyleClassPrefix}-bond-level-stat`}>
                {'\u2014'}
            </div>
        );
    }
    return (
        <div className={`${StyleClassPrefix}-bond-level-stat`}>
            <ServantBondIcon bond={bond} size={24} />
            <div className='pl-1'>{bond}</div>
        </div>
    );
};

const ServantStatLabelWidth = '60%';

const MaterialLabelWidth = '80%';

const StyleClassPrefix = 'MasterServantsRouteInfoPanel';

const StyleProps = (theme: SystemTheme) => {

    const {
        palette,
        breakpoints,
        spacing
    } = theme as Theme;

    return {
        width: spacing(90),  // 360px
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        [`& .${StyleClassPrefix}-actions-container`]: {
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
                justifyContent: 'flex-start'
            },
            '&>:not(:first-of-type)': {
                display: 'none'
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterServantsRouteInfoPanel = React.memo((props: Props) => {

    const {
        activeServantsData,
        bondLevels,
        // editMode,
        keepChildrenMounted,
        onOpenToggle,
        // onStatsChange,
        open,
        statsOptions,
        unlockedCostumes
    } = props;

    const gameItemMap = useGameItemMap();

    const [selectedServantsEnhancementRequirements, setSelectedServantsEnhancementRequirements] = useState<EnhancementRequirements>();

    const renderChildren = open || keepChildrenMounted;

    useEffect(() => {
        if (!renderChildren || !activeServantsData.length) {
            setSelectedServantsEnhancementRequirements(undefined);
        } else {
            const results = [];
            for (const activeServant of activeServantsData) {
                const result = PlanComputationUtils.computeServantEnhancementRequirements(
                    activeServant.gameServant,
                    activeServant.masterServant,
                    unlockedCostumes, 
                    statsOptions
                );
                results.push(result);
            }
            setSelectedServantsEnhancementRequirements(PlanComputationUtils.sumEnhancementRequirements(results));
        }
    }, [activeServantsData, renderChildren, statsOptions, unlockedCostumes]);

    const actionButtonsNode: ReactNode = (
        <div className={`${StyleClassPrefix}-actions-container`}>
            <div>
                <IconButton size='large' onClick={onOpenToggle}>
                    <Icon>
                        {open ? 'chevron_right' : 'chevron_left'}
                    </Icon>
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
        if (activeServantsData.length === 1) {
            const gameServant = activeServantsData[0].gameServant;
            return (
                <div className={`${StyleClassPrefix}-title`}>
                    <div className={clsx(`${StyleClassPrefix}-servant-name`, 'truncate')}>
                        {GameServantUtils.getDisplayedName(gameServant)}
                    </div>
                </div>
            );
        }
        return (
            <div className={`${StyleClassPrefix}-title`}>
                {!activeServantsData.length ? 'No servant selected' : 'Multiple servants selected'}
            </div>
        );
    }, [activeServantsData, renderChildren]);

    const servantStatsNode: ReactNode = useMemo(() => {
        if (!renderChildren || activeServantsData.length !== 1) {
            return null;
        }
        const {
            gameServant,
            masterServant
        } = activeServantsData[0];
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
                    value={`${gameServant.rarity || '\u2014'} \u2605`}
                />
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Class'
                    labelWidth={ServantStatLabelWidth}
                    value={GameServantConstants.ClassDisplayNameMap[gameServant.class || GameServantClass.Unknown]}
                />
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Level'
                    labelWidth={ServantStatLabelWidth}
                    value={masterServant.level}
                />
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Ascension'
                    labelWidth={ServantStatLabelWidth}
                    value={masterServant.ascension}
                />
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Fou (HP/ATK)'
                    labelWidth={ServantStatLabelWidth}
                    value={renderFouLevels(masterServant)}
                />
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Skills'
                    labelWidth={ServantStatLabelWidth}
                    value={renderSkillLevels(masterServant, 'skills')}
                />
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Append Skills'
                    labelWidth={ServantStatLabelWidth}
                    value={renderSkillLevels(masterServant, 'appendSkills')}
                />
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Noble Phantasm'
                    labelWidth={ServantStatLabelWidth}
                    value={renderNpLevel(masterServant)}
                />
                <DataPointListItem
                    className={`${StyleClassPrefix}-servant-stat`}
                    label='Bond'
                    labelWidth={ServantStatLabelWidth}
                    value={renderBondLevel(bondLevels[masterServant.gameId])}
                />
            </div>
            <div className={`${StyleClassPrefix}-divider`} />
        </>;
        // }
    }, [activeServantsData, bondLevels, renderChildren]);

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
                        <ItemThumbnail gameItem={gameItem} size={24} />
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
        if (!renderChildren || activeServantsData.length !== 1) {
            return null;
        }
        /**
         * FIXME Need to get links from back-end.
         */
        const links: Array<ExternalLink> = [];
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
    }, [activeServantsData, renderChildren]);

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
