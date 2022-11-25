import { Theme } from '@mui/material';
import { alpha, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import { StyleClassPrefix as HeaderStyleClassPrefix } from './PlanRequirementsTableHeader';
import { StyleClassPrefix as ServantRowStyleClassPrefix } from './PlanRequirementsTableServantRow';
import { StyleClassPrefix as ServantRowHeaderStyleClassPrefix } from './PlanRequirementsTableServantRowHeader';
import { StyleClassPrefix as ServantRowCellStyleClassPrefix } from './PlanRequirementsTableServantRowCell';
import { ThemeConstants } from '../../../../styles/theme-constants';

export const StyleClassPrefix = 'PlanRequirementsTable';

/**
 * For optimization purposes this entire style function contains style
 * properties for `PlanRequirementsTable` and children components.
 */
export const PlanRequirementsTableStyle = (theme: SystemTheme): SystemStyleObject => {

    const {
        palette,
        // spacing
    } = theme as Theme;

    const baseStyle: SystemStyleObject = {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
        [`& .${StyleClassPrefix}-table-container`]: {
            backgroundColor: palette.background.paper,
            height: '100%',
            overflow: 'auto',
            /**
             * PlanRequirementsTableHeader component
             */
            [`& .${HeaderStyleClassPrefix}-root`]: {
                position: 'sticky',
                top: 0,
                zIndex: 3
            },
            /**
             * PlanRequirementsServantRow component
             */
            [`& .${ServantRowStyleClassPrefix}-root`]: {
                // backgroundColor: palette.background.paper,
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
                    // backgroundColor: palette.background.paper
                    [`& .${ServantRowCellStyleClassPrefix}-hover-overlay`]: {
                        width: '100%',
                        height: '100%'
                    }
                },
                [`&.${ServantRowStyleClassPrefix}-active`]: {
                    [`&, .${ServantRowHeaderStyleClassPrefix}-hover-overlay`]: {
                        backgroundColor: `${alpha(palette.primary.main, ThemeConstants.ActiveAlpha)} !important`
                    }
                }
            }
        }
    };

    return baseStyle;
    
};
