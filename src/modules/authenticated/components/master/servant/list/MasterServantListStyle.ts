import { CSSInterpolation, Theme } from '@mui/material';
import { DataTableListRowStyle } from '../../../../../../components/data-table-list/DataTableListRowStyle';
import { StyleClassPrefix as ServantSkillLevelStyleClassPrefix } from '../../../../../../components/servant/ServantSkillLevels';
import { StyleClassPrefix as ServantThumbnailStyleClassPrefix } from '../../../../../../components/servant/ServantThumbnail';
import { StyledFunctionPropsWithTheme, StyledFunctionThemeProp } from '../../../../../../types';
import { MasterServantListColumn } from './MasterServantListColumn';
import { StyleClassPrefix as MasterServantListRowBondLevelStyleClassPrefix } from './MasterServantListRowBondLevel';
import { StyleClassPrefix as MasterServantListRowFouLevelStyleClassPrefix } from './MasterServantListRowFouLevel';
import { StyleClassPrefix as MasterServantListRowLabelStyleClassPrefix } from './MasterServantListRowLabel';
import { StyleClassPrefix as MasterServantListRowLevelStyleClassPrefix } from './MasterServantListRowLevel';
import { StyleClassPrefix as MasterServantListRowNpLevelStyleClassPrefix } from './MasterServantListRowNpLevel';
import { StyleClassPrefix as MasterServantListRowStatsStyleClassPrefix } from './MasterServantListRowStats';
import { StyleClassPrefix as MasterServantListRowSummonDateStyleClassPrefix } from './MasterServantListRowSummonDate';
import { StyleClassPrefix as MasterServantListRowStyleClassPrefix } from './MasterServantListRow';

export const StyleClassPrefix = 'MasterServantList';

export const MasterServantListRowHeight = 52;

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
                    display: 'flex',
                    alignItems: 'center',
                    width: 'fit-content',
                    minWidth: '100%',
                    [`& .${MasterServantListRowStyleClassPrefix}-content`]: {
                        userSelect: 'none',
                        flex: 1,
                        display: 'flex',
                        alignContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        height: MasterServantListRowHeight,
                        fontSize: '0.875rem',
                        [`& .${MasterServantListRowLabelStyleClassPrefix}-root`]: {
                            display: 'flex',
                            alignItems: 'center',
                            width: MasterServantListColumn.Properties.label.width,
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
                                width: MasterServantListColumn.Properties.npLevel.width,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '& .MuiIcon-root': {
                                    fontSize: '1.25rem'
                                },
                                '& img': {
                                    paddingRight: spacing(1),
                                    width: '18px',
                                    height: '18px'
                                }
                            },
                            [`& .${MasterServantListRowLevelStyleClassPrefix}-root`]: {
                                width: MasterServantListColumn.Properties.level.width,
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
                                width: MasterServantListColumn.Properties.fouHp.width
                            },
                            [`& .${ServantSkillLevelStyleClassPrefix}-root`]: {
                                width: MasterServantListColumn.Properties.skills.width
                            },
                            [`& .${MasterServantListRowBondLevelStyleClassPrefix}-root`]: {
                                width: MasterServantListColumn.Properties.bondLevel.width,
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
                                width: MasterServantListColumn.Properties.summonDate.width
                            }
                        }
                    }
                },
                [`&:not(.${StyleClassPrefix}-drag-drop-mode)`]: {
                    [`& .${ServantThumbnailStyleClassPrefix}-root`]: {
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
        DataTableListRowStyle(rowStyledProps)
    ];

};
