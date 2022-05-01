import { Box, SystemStyleObject, Theme } from '@mui/system';
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

export const StyleClassPrefix = 'MasterServantCostumesListHeader';

const StyleProps = {
    display: 'flex',
    pl: 4,
    pr: 1,
    py: 4,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'divider',
    fontFamily: ThemeConstants.FontFamilyGoogleSans,
    fontWeight: 500,
    textAlign: 'center',
    fontSize: '0.875rem',
    '&.drag-drop-mode': {
        pl: 4 + 5
    },
    [`& .${StyleClassPrefix}-info`]: {
        flex: ColumnWidths.info
    },
    [`& .${StyleClassPrefix}-stats`]: {
        display: 'flex',
        flex: ColumnWidths.stats.container,
        [`& .${StyleClassPrefix}-np-level`]: {
            flex: ColumnWidths.stats.npLevel
        },
        [`& .${StyleClassPrefix}-level`]: {
            flex: ColumnWidths.stats.level
        },
        [`& .${StyleClassPrefix}-fou-hp`]: {
            flex: ColumnWidths.stats.fou
        },
        [`& .${StyleClassPrefix}-fou-atk`]: {
            flex: ColumnWidths.stats.fou
        },
        [`& .${StyleClassPrefix}-skills`]: {
            flex: ColumnWidths.stats.skills
        },
        [`& .${StyleClassPrefix}-append-skills`]: {
            flex: ColumnWidths.stats.skills
        },
        [`& .${StyleClassPrefix}-bond-level`]: {
            flex: ColumnWidths.stats.bondLevel
        }
    },
    [`& .${StyleClassPrefix}-actions`]: {
        width: ColumnWidths.actions
    }
} as SystemStyleObject<Theme>;

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
        <Box className={clsx(`${StyleClassPrefix}-root`, dragDropMode && 'drag-drop-mode')} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-info`}>
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
        </Box>
    );

});
