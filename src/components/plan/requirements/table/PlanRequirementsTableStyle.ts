import { Theme } from '@mui/material';
import { alpha, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { StyleClassPrefix as FooterStyleClassPrefix } from './PlanRequirementsTableFooter';
import { StyleClassPrefix as FooterCellStyleClassPrefix } from './PlanRequirementsTableFooterCell';
import { StyleClassPrefix as HeaderStyleClassPrefix } from './PlanRequirementsTableHeader';
import { StyleClassPrefix as HeaderCellStyleClassPrefix } from './PlanRequirementsTableHeaderCell';
import { StyleClassPrefix as ServantRowStyleClassPrefix } from './PlanRequirementsTableServantRow';
import { StyleClassPrefix as ServantRowCellStyleClassPrefix } from './PlanRequirementsTableServantRowCell';
import { StyleClassPrefix as ServantRowHeaderStyleClassPrefix } from './PlanRequirementsTableServantRowHeader';

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
            /**
             * PlanRequirementsTableHeader component
             */
            [`& .${HeaderStyleClassPrefix}-root`]: {
                position: 'sticky',
                top: 0,
                zIndex: 3,
                [`& .${HeaderStyleClassPrefix}-sticky-content`]: {
                    width: 320,
                    height: '100%',
                    backgroundColor: palette.background.paper
                },
                /**
                 * PlanRequirementsTableHeaderCell component
                 */
                [`& .${HeaderCellStyleClassPrefix}-root`]: {
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
                    width: 320,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: palette.background.paper,
                    [`& .${ServantRowHeaderStyleClassPrefix}-hover-overlay`]: {
                        position: 'absolute',
                        width: '100%',
                        height: '100%'
                    },
                    [`& .${ServantRowHeaderStyleClassPrefix}-name`]: {
                        userSelect: 'none',
                        flex: 1,
                        px: 2
                    }
                },
                /**
                 * PlanRequirementsServantRowCell component
                 */
                [`& .${ServantRowCellStyleClassPrefix}-root`]: {
                    userSelect: 'none',
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
                zIndex: 3,
                [`& .${FooterStyleClassPrefix}-sticky-content`]: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 320,
                    height: '100%',
                    fontWeight: 500,
                    background: palette.background.paper
                },
                /**
                 * PlanRequirementsTableFooterCell component
                 */
                [`& .${FooterCellStyleClassPrefix}-root`]: {
                    userSelect: 'none',
                    fontSize: '1rem',
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
        }
    };

    return baseStyle;
    
};