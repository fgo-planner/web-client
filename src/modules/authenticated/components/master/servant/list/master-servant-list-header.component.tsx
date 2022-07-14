import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React from 'react';
import { ThemeConstants } from '../../../../../../styles/theme-constants';
import { ReadonlyPartial } from '../../../../../../types/internal';
import { MasterServantListColumnWidths as ColumnWidths, MasterServantListVisibleColumns } from './master-servant-list-columns';

type Props = {
    dragDropMode?: boolean;
    visibleColumns?: ReadonlyPartial<MasterServantListVisibleColumns>;
    viewLayout?: any; // TODO Make use of this
};

export const StyleClassPrefix = 'MasterServantListHeader';

const StyleProps = (theme: SystemTheme) => {

    const {
        palette
    } = theme as Theme;

    return {
        // overflowX: 'auto',
        // overflowY: 'hidden',
        position: 'sticky',
        top: 0,
        width: 'fit-content',
        minHeight: 54,
        backgroundColor: palette.background.paper,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
        zIndex: 2,  // This needs to be higher than the .sticky-content in the rows
        [`& .${StyleClassPrefix}-content`]: {
            display: 'flex',
            pl: 3,
            py: 4,
            fontFamily: ThemeConstants.FontFamilyGoogleSans,
            fontWeight: 500,
            textAlign: 'center',
            fontSize: '0.875rem',
            '&.drag-drop-mode': {
                pl: 10
            },
            [`& .${StyleClassPrefix}-label`]: {
                minWidth: ColumnWidths.label + 52
            },
            [`& .${StyleClassPrefix}-stats`]: {
                display: 'flex',
                [`& .${StyleClassPrefix}-np-level`]: {
                    width: ColumnWidths.stats.npLevel
                },
                [`& .${StyleClassPrefix}-level`]: {
                    width: ColumnWidths.stats.level
                },
                [`& .${StyleClassPrefix}-fou-hp`]: {
                    width: ColumnWidths.stats.fou
                },
                [`& .${StyleClassPrefix}-fou-atk`]: {
                    width: ColumnWidths.stats.fou
                },
                [`& .${StyleClassPrefix}-skills`]: {
                    width: ColumnWidths.stats.skills
                },
                [`& .${StyleClassPrefix}-append-skills`]: {
                    width: ColumnWidths.stats.skills
                },
                [`& .${StyleClassPrefix}-bond-level`]: {
                    width: ColumnWidths.stats.bondLevel
                }
            },
            [`& .${StyleClassPrefix}-actions`]: {
                width: ColumnWidths.actions
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterServantListHeader = React.memo(({ dragDropMode, visibleColumns }: Props) => {

    const {
        npLevel,
        level,
        fouHp,
        fouAtk,
        skills,
        appendSkills,
        bondLevel,
        actions
    } = visibleColumns || {};

    return (
        <Box className={clsx(`${StyleClassPrefix}-root`, ThemeConstants.ClassScrollbarHidden)} sx={StyleProps}>
            <div className={clsx(`${StyleClassPrefix}-content`, dragDropMode && 'drag-drop-mode')}>

                <div className={`${StyleClassPrefix}-label`}>
                    Servant
                </div>
                <div className={`${StyleClassPrefix}-stats`}>
                    {npLevel &&
                        <div className={`${StyleClassPrefix}-np-level`}>
                            NP
                        </div>
                    }
                    {level &&
                        <div className={`${StyleClassPrefix}-level`}>
                            Level
                        </div>
                    }
                    {fouHp &&
                        <div className={`${StyleClassPrefix}-fou-hp`}>
                            Fou (HP)
                        </div>
                    }
                    {fouAtk &&
                        <div className={`${StyleClassPrefix}-fou-atk`}>
                            Fou (ATK)
                        </div>
                    }
                    {skills &&
                        <div className={`${StyleClassPrefix}-skills`}>
                            Skills
                        </div>
                    }
                    {appendSkills &&
                        <div className={`${StyleClassPrefix}-append-skills`}>
                            Append
                        </div>
                    }
                    {bondLevel &&
                        <div className={`${StyleClassPrefix}-bond-level`}>
                            Bond
                        </div>
                    }
                    {actions &&
                        <div className={`${StyleClassPrefix}-actions`}>
                            Actions
                        </div>}
                </div>
            </div>
        </Box>
    );

});
