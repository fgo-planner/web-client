import { CSSInterpolation, Theme } from '@mui/material';
import { DataTableListBaseRowStyle } from '../../../../../../components/data-table-list/data-table-list-base-row.style';
import { DataTableListDraggableRowStyle } from '../../../../../../components/data-table-list/data-table-list-draggable-row.style';
import { StyleClassPrefix as GameServantThumbnailStyleClassPrefix } from '../../../../../../components/game/servant/game-servant-thumbnail.component';
import { StyledFunctionPropsWithTheme, StyledFunctionThemeProp } from '../../../../../../types/internal';
import { MasterServantColumnProperties } from './master-servant-list-columns';
import { StyleClassPrefix as MasterServantListRowBondLevelStyleClassPrefix } from './master-servant-list-row-bond-level.component';
import { StyleClassPrefix as MasterServantListRowFouLevelStyleClassPrefix } from './master-servant-list-row-fou-level.component';
import { StyleClassPrefix as MasterServantListRowLabelStyleClassPrefix } from './master-servant-list-row-label.component';
import { StyleClassPrefix as MasterServantListRowLevelStyleClassPrefix } from './master-servant-list-row-level.component';
import { StyleClassPrefix as MasterServantListRowNpLevelStyleClassPrefix } from './master-servant-list-row-np-level.component';
import { StyleClassPrefix as MasterServantListRowSkillLevelStyleClassPrefix } from './master-servant-list-row-skill-level.component';
import { StyleClassPrefix as MasterServantListRowStatsStyleClassPrefix } from './master-servant-list-row-stats.component';
import { StyleClassPrefix as MasterServantListRowSummonDateStyleClassPrefix } from './master-servant-list-row-summon-date.component';
import { StyleClassPrefix as MasterServantListRowStyleClassPrefix } from './master-servant-list-row.component';

export const StyleClassPrefix = 'MasterServantList';

/**
 * For optimization purposes this entire style function contains style
 * properties for all of the `MasterServantList` children components.
 */
export const MasterServantListStyle = ({ theme }: StyledFunctionThemeProp): Array<CSSInterpolation> => {

    const {
        palette,
        spacing
    } = theme as Theme;

    const baseStyle = {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        [`& .${StyleClassPrefix}-list-container`]: {
            backgroundColor: palette.background.paper,
            height: '100%',
            overflow: 'auto',
            [`& .${StyleClassPrefix}-list`]: {
                [`& .${MasterServantListRowStyleClassPrefix}-root`]: {
                    width: 'fit-content',
                    minWidth: '100%',
                    [`& .${MasterServantListRowStyleClassPrefix}-content`]: {
                        userSelect: 'none',
                        flex: 1,
                        display: 'flex',
                        alignContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        height: 52,
                        fontSize: '0.875rem',
                        [`& .${MasterServantListRowLabelStyleClassPrefix}-root`]: {
                            display: 'flex',
                            alignItems: 'center',
                            width: MasterServantColumnProperties.label.width,
                            [`& .${MasterServantListRowLabelStyleClassPrefix}-class-icon`]: {
                                paddingLeft: spacing(4)
                            },
                            [`& .${MasterServantListRowLabelStyleClassPrefix}-rarity`]: {
                                minWidth: spacing(7),  // 28px
                                paddingRight: spacing(4),
                                paddingLeft: spacing(4)
                            }
                        },
                        [`& .${MasterServantListRowStatsStyleClassPrefix}-root`]: {
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            [`& .${MasterServantListRowNpLevelStyleClassPrefix}-root`]: {
                                width: MasterServantColumnProperties.npLevel.width,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '& img': {
                                    paddingRight: spacing(1),
                                    width: '18px',
                                    height: '18px'
                                }
                            },
                            [`& .${MasterServantListRowLevelStyleClassPrefix}-root`]: {
                                width: MasterServantColumnProperties.level.width,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&>.value': {
                                    width: '28px',
                                    textAlign: 'right',
                                    paddingRight: spacing(3)
                                },
                                '&>img': {
                                    width: '16px',
                                    height: '16px'
                                },
                                '&>.ascension': {
                                    width: '16px'
                                }
                            },
                            [`& .${MasterServantListRowFouLevelStyleClassPrefix}-root`]: {
                                width: MasterServantColumnProperties.fouHp.width
                            },
                            [`& .${MasterServantListRowSkillLevelStyleClassPrefix}-root`]: {
                                width: MasterServantColumnProperties.skills.width,
                                display: 'flex',
                                textAlign: 'center',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&>.value': {
                                    width: '1.25rem'
                                },
                            },
                            [`& .${MasterServantListRowBondLevelStyleClassPrefix}-root`]: {
                                width: MasterServantColumnProperties.bondLevel.width,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&>.value': {
                                    paddingLeft: spacing(1.5),
                                    width: '1.25rem',
                                    textAlign: 'left'
                                }
                            },
                            [`& .${MasterServantListRowSummonDateStyleClassPrefix}-root`]: {
                                width: MasterServantColumnProperties.summonDate.width
                            },
                        }
                    }
                },
                '&:not(.drag-drop-mode)': {
                    [`& .${GameServantThumbnailStyleClassPrefix}-root`]: {
                        paddingLeft: spacing(3)
                    },
                    [`& .${MasterServantListRowStyleClassPrefix}-sticky-content`]: {
                        left: spacing(-3)
                    }
                }
            }
        }
    } as CSSInterpolation;

    const rowStyledProps = {
        classPrefix: MasterServantListRowStyleClassPrefix,
        theme
    } as StyledFunctionPropsWithTheme;

    return [
        baseStyle,
        DataTableListBaseRowStyle(rowStyledProps),
        DataTableListDraggableRowStyle(rowStyledProps)
    ];
    
};
