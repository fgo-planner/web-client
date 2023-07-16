import { Theme } from '@mui/material';
import { alpha, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import { ThemeConstants } from '../../../../styles/ThemeConstants';
import { StyleClassPrefix as ServantSkillLevelStyleClassPrefix } from '../../../servant/ServantSkillLevels';
import { StyleClassPrefix as FooterStyleClassPrefix } from './PlanRequirementsTableFooter';
import { StyleClassPrefix as FooterCellStyleClassPrefix } from './PlanRequirementsTableFooterCell';
import { StyleClassPrefix as HeaderStyleClassPrefix } from './PlanRequirementsTableHeader';
import { StyleClassPrefix as HeaderCellStyleClassPrefix } from './PlanRequirementsTableHeaderCell';
import { StyleClassPrefix as ServantRowStyleClassPrefix } from './PlanRequirementsTableServantRow';
import { StyleClassPrefix as ServantRowAscensionTargetStyleClassPrefix } from './PlanRequirementsTableServantRowAscensionTarget';
import { StyleClassPrefix as ServantRowCellStyleClassPrefix } from './PlanRequirementsTableServantRowCell';
import { StyleClassPrefix as ServantRowCostumeTargetStyleClassPrefix } from './PlanRequirementsTableServantRowCostumeTarget';
import { StyleClassPrefix as ServantRowEnhancementTargetsStyleClassPrefix } from './PlanRequirementsTableServantRowEnhancementTargets';
import { StyleClassPrefix as ServantRowHeaderStyleClassPrefix } from './PlanRequirementsTableServantRowHeader';
import { StyleClassPrefix as ServantRowLevelTargetStyleClassPrefix } from './PlanRequirementsTableServantRowLevelTarget';
import { StyleClassPrefix as ServantRowSkillTargetsStyleClassPrefix } from './PlanRequirementsTableServantRowSkillTargets';

/**
 * 360px at 16px font-size
 */
const StickyColumnWidth = '22.5em';

/**
 * 37px at 16px font-size. This needs to be in rem due to display size scaling.
 */
const DragHandleWidth = '2.3125rem';

const EnhancementTargetsFontSize = '0.8125em';

const CellValueFontSize = '1.125em';

export const StyleClassPrefix = 'PlanRequirementsTable';

/**
 * For optimization purposes this entire style function contains style
 * properties for `PlanRequirementsTable` and children components.
 */
export const PlanRequirementsTableStyle = (theme: SystemTheme): SystemStyleObject => {

    const { palette } = theme as Theme;

    const activeBackgroundColor = `${alpha(palette.primary.main, ThemeConstants.ActiveAlpha)} !important`;
    const hoverBackgroundColor = `${alpha(palette.text.primary, ThemeConstants.HoverAlpha)} !important`;
    const activeHoverBackgroundColor = `${alpha(palette.primary.main, ThemeConstants.ActiveHoverAlpha)} !important`;

    const baseStyle: SystemStyleObject = {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
        [`& .${StyleClassPrefix}-table-container`]: {
            overflow: 'auto',
            width: 'fit-content',
            maxWidth: '100%',
            backgroundColor: palette.background.paper,
            boxSizing: 'border-box',
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: palette.divider,
            borderRightWidth: 1,
            borderRightStyle: 'solid',
            borderRightColor: palette.divider,
            /**
             * PlanRequirementsTableHeader component
             */
            [`& .${HeaderStyleClassPrefix}-root`]: {
                position: 'sticky',
                top: 0,
                zIndex: 5,
                [`& .${HeaderStyleClassPrefix}-sticky-content`]: {
                    width: StickyColumnWidth,
                    height: '100%',
                    backgroundColor: palette.background.paper
                },
                /**
                 * PlanRequirementsTableHeaderCell component
                 */
                [`& .${HeaderCellStyleClassPrefix}-root`]: {
                    '&:last-of-type': {
                        borderRightWidth: 0
                    },
                    [`&.${HeaderCellStyleClassPrefix}-active`]: {
                        backgroundColor: activeBackgroundColor
                    },
                    [`&.${HeaderCellStyleClassPrefix}-hover`]: {
                        backgroundColor: hoverBackgroundColor,
                        [`&.${HeaderCellStyleClassPrefix}-active`]: {
                            backgroundColor: activeHoverBackgroundColor
                        }
                    }
                }
            },
            /**
             * PlanRequirementsServantRow component
             */
            [`& .${ServantRowStyleClassPrefix}-root`]: {
                /**
                 * PlanRequirementsServantRowHeader component
                 */
                [`& .${ServantRowHeaderStyleClassPrefix}-root`]: {
                    userSelect: 'none',
                    width: StickyColumnWidth,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: palette.background.paper,
                    [`& .${ServantRowHeaderStyleClassPrefix}-hover-overlay`]: {
                        position: 'absolute',
                        width: '100%',
                        height: '100%'
                    },
                    [`& .${ServantRowHeaderStyleClassPrefix}-content`]: {
                        flex: 1,
                        px: 2,
                        [`&.${ServantRowHeaderStyleClassPrefix}-name`]: {
                            mx: 2,
                            fontSize: '0.875rem'  // Scale this with rem rather than em
                        }
                    }
                },
                /**
                 * PlanRequirementsTableServantRowEnhancementTargets component
                 */
                [`& .${ServantRowEnhancementTargetsStyleClassPrefix}-root`]: {
                    ml: 1,
                    [`& .${ServantRowEnhancementTargetsStyleClassPrefix}-row`]: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        my: 1,
                        [`& .${ServantRowEnhancementTargetsStyleClassPrefix}-arrow`]: {
                            mx: 1.5
                        },
                        /**
                         * PlanRequirementsTableServantRowLevelTarget component
                         */
                        [`& .${ServantRowLevelTargetStyleClassPrefix}-root`]: {
                            display: 'flex',
                            fontSize: EnhancementTargetsFontSize,
                            '>span:first-of-type': {
                                color: 'goldenrod',
                                fontWeight: 800,
                                mr: 1
                            },
                            [`&.${ServantRowLevelTargetStyleClassPrefix}-disabled`]: {
                                color: palette.text.disabled,
                                '>span:first-of-type': {
                                    color: palette.text.disabled,
                                    textShadow: 'none'
                                }
                            }
                        },
                        /**
                         * PlanRequirementsTableServantRowAscensionTarget component
                         */
                        [`& .${ServantRowAscensionTargetStyleClassPrefix}-root`]: {
                            display: 'flex',
                            alignItems: 'center',
                            width: '5em',  // 80px at 16px font-size
                            '>img': {
                                width: '1em',
                                height: '1em',
                                position: 'relative',
                                right: '0.25em'
                            },
                            '>div': {
                                fontSize: EnhancementTargetsFontSize
                            },
                            [`&.${ServantRowAscensionTargetStyleClassPrefix}-disabled`]: {
                                color: palette.text.disabled
                            }
                        },
                        /**
                         * PlanRequirementsTableServantRowSkillTargets component
                         */
                        [`& .${ServantRowSkillTargetsStyleClassPrefix}-root`]: {
                            display: 'flex',
                            fontSize: EnhancementTargetsFontSize,
                            [`&.${ServantRowSkillTargetsStyleClassPrefix}-skill1-disabled`]: {
                                [`& .${ServantRowSkillTargetsStyleClassPrefix}-target .${ServantSkillLevelStyleClassPrefix}-skill1`]: {
                                    color: palette.text.disabled
                                }
                            },
                            [`&.${ServantRowSkillTargetsStyleClassPrefix}-skill2-disabled`]: {
                                [`& .${ServantRowSkillTargetsStyleClassPrefix}-target .${ServantSkillLevelStyleClassPrefix}-skill2`]: {
                                    color: palette.text.disabled
                                }
                            },
                            [`&.${ServantRowSkillTargetsStyleClassPrefix}-skill3-disabled`]: {
                                [`& .${ServantRowSkillTargetsStyleClassPrefix}-target .${ServantSkillLevelStyleClassPrefix}-skill3`]: {
                                    color: palette.text.disabled
                                }
                            },
                            [`&.${ServantRowSkillTargetsStyleClassPrefix}-disabled`]: {
                                color: palette.text.disabled
                            }
                        },
                        /**
                         * PlanRequirementsTableServantRowCostumeTarget component
                         */
                        [`& .${ServantRowCostumeTargetStyleClassPrefix}-root`]: {
                            '& .MuiIcon-root': {
                                color: palette.secondary.main,
                                fontSize: '1.5em',
                                mr: 1
                            },
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: EnhancementTargetsFontSize,
                            mr: 3
                        }
                    }
                },
                /**
                 * PlanRequirementsServantRowCell component
                 */
                [`& .${ServantRowCellStyleClassPrefix}-root`]: {
                    userSelect: 'none',
                    '> span': {
                        fontSize: CellValueFontSize
                    },
                    '&:last-of-type': {
                        borderRightWidth: 0
                    },
                    [`&.${ServantRowCellStyleClassPrefix}-active`]: {
                        backgroundColor: activeBackgroundColor
                    },
                    [`&.${ServantRowCellStyleClassPrefix}-hover`]: {
                        backgroundColor: hoverBackgroundColor,
                        [`&.${ServantRowCellStyleClassPrefix}-active`]: {
                            backgroundColor: activeHoverBackgroundColor
                        }
                    }
                },
                [`&.${ServantRowStyleClassPrefix}-active`]: {
                    [`& .${ServantRowHeaderStyleClassPrefix}-hover-overlay`]: {
                        backgroundColor: activeBackgroundColor
                    }
                },
                [`&.${ServantRowStyleClassPrefix}-hover`]: {
                    [`& .${ServantRowHeaderStyleClassPrefix}-hover-overlay`]: {
                        backgroundColor: hoverBackgroundColor
                    },
                    [`&.${ServantRowStyleClassPrefix}-active`]: {
                        [`& .${ServantRowHeaderStyleClassPrefix}-hover-overlay`]: {
                            backgroundColor: activeHoverBackgroundColor
                        }
                    }
                }
            },
            /**
             * PlanRequirementsTableFooter component
             */
            [`& .${FooterStyleClassPrefix}-root`]: {
                position: 'sticky',
                bottom: 0,
                zIndex: 5,
                [`& .${FooterStyleClassPrefix}-sticky-content`]: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    width: StickyColumnWidth,
                    height: '100%',
                    px: 4,
                    boxSizing: 'border-box',
                    background: palette.background.paper,
                    '& .MuiIconButton-root': {
                        mx: 2
                    },
                    '> span': {
                        fontFamily: ThemeConstants.FontFamilyGoogleSans,
                        fontSize: '0.9375rem',
                        fontWeight: 500
                    }
                },
                /**
                 * PlanRequirementsTableFooterCell component
                 */
                [`& .${FooterCellStyleClassPrefix}-root`]: {
                    userSelect: 'none',
                    '> span': {
                        fontSize: CellValueFontSize
                    },
                    '&:last-of-type': {
                        borderRightWidth: 0
                    },
                    [`&.${FooterCellStyleClassPrefix}-active`]: {
                        backgroundColor: activeBackgroundColor
                    },
                    [`&.${FooterCellStyleClassPrefix}-hover`]: {
                        backgroundColor: hoverBackgroundColor,
                        [`&.${FooterCellStyleClassPrefix}-active`]: {
                            backgroundColor: activeHoverBackgroundColor
                        }
                    }
                }
            }
        },
        [`&.${StyleClassPrefix}-drag-drop-mode`]: {
            // eslint-disable-next-line max-len
            [`& .${HeaderStyleClassPrefix}-sticky-content, .${ServantRowHeaderStyleClassPrefix}-root, .${FooterStyleClassPrefix}-sticky-content`]: {
                width: `calc(${StickyColumnWidth} + ${DragHandleWidth}) !important`
            }
        }
    };

    return baseStyle;

};
