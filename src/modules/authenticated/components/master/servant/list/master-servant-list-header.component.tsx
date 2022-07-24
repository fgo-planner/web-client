import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React from 'react';
import { HeaderLabel } from '../../../../../../components/text/header-label.component';
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

    const { palette } = theme as Theme;

    return {
        position: 'sticky',
        top: 0,
        width: 'fit-content',
        minWidth: '100%',
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
        bondLevel
    } = visibleColumns || {};

    return (
        <Box className={clsx(`${StyleClassPrefix}-root`, ThemeConstants.ClassScrollbarHidden)} sx={StyleProps}>
            <div className={clsx(`${StyleClassPrefix}-content`, dragDropMode && 'drag-drop-mode')}>

                <HeaderLabel className={`${StyleClassPrefix}-label`}>
                    Servant
                </HeaderLabel>
                <div className={`${StyleClassPrefix}-stats`}>
                    {npLevel &&
                        <HeaderLabel className={`${StyleClassPrefix}-np-level`}>
                            NP
                        </HeaderLabel>
                    }
                    {level &&
                        <HeaderLabel className={`${StyleClassPrefix}-level`}>
                            Level
                        </HeaderLabel>
                    }
                    {fouHp &&
                        <HeaderLabel className={`${StyleClassPrefix}-fou-hp`}>
                            Fou (HP)
                        </HeaderLabel>
                    }
                    {fouAtk &&
                        <HeaderLabel className={`${StyleClassPrefix}-fou-atk`}>
                            Fou (ATK)
                        </HeaderLabel>
                    }
                    {skills &&
                        <HeaderLabel className={`${StyleClassPrefix}-skills`}>
                            Skills
                        </HeaderLabel>
                    }
                    {appendSkills &&
                        <HeaderLabel className={`${StyleClassPrefix}-append-skills`}>
                            Append
                        </HeaderLabel>
                    }
                    {bondLevel &&
                        <HeaderLabel className={`${StyleClassPrefix}-bond-level`}>
                            Bond
                        </HeaderLabel>
                    }
                </div>
            </div>
        </Box>
    );

});
