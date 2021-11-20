import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React from 'react';
import { ThemeConstants } from '../../../../../../styles/theme-constants';
import { ReadonlyPartial } from '../../../../../../types/internal';
import { MasterServantListColumnWidths as ColumnWidths, MasterServantListVisibleColumns } from './master-servant-list-columns';

type Props = {
    editMode?: boolean;
    visibleColumns?: ReadonlyPartial<MasterServantListVisibleColumns>;
    viewLayout?: any; // TODO Make use of this
};

export const StyleClassPrefix = 'MasterServantCostumesListHeader';

const StyleProps = {
    display: 'flex',
    pl: 4,
    py: 4,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'divider',
    fontFamily: ThemeConstants.FontFamilyGoogleSans,
    fontWeight: 500,
    textAlign: 'center',
    fontSize: '0.875rem',
    '&.edit-mode': {
        pl: 4 + 5
    },
    [`& .${StyleClassPrefix}-label`]: {
        flex: ColumnWidths.label
    },
    [`& .${StyleClassPrefix}-np-level`]: {
        flex: ColumnWidths.npLevel
    },
    [`& .${StyleClassPrefix}-level`]: {
        flex: ColumnWidths.level
    },
    [`& .${StyleClassPrefix}-fou-hp`]: {
        flex: ColumnWidths.fouHp
    },
    [`& .${StyleClassPrefix}-fou-atk`]: {
        flex: ColumnWidths.fouAtk
    },
    [`& .${StyleClassPrefix}-skill-levels`]: {
        flex: ColumnWidths.skillLevels
    },
    [`& .${StyleClassPrefix}-bond-level`]: {
        flex: ColumnWidths.bondLevel
    },
    [`& .${StyleClassPrefix}-actions`]: {
        width: ColumnWidths.actions
    }
} as SystemStyleObject<Theme>;

export const MasterServantListHeader = React.memo(({ editMode, visibleColumns }: Props) => {

    const {
        npLevel,
        level,
        fouHp,
        fouAtk,
        skillLevels,
        bondLevel,
        actions
    } = visibleColumns || {};

    return (
        <Box className={clsx(`${StyleClassPrefix}-root`, editMode && 'edit-mode')} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-label`}>
                Servant
            </div>
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
            {skillLevels &&
                <div className={`${StyleClassPrefix}-skill-levels`}>
                    Skills
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
        </Box>
    );
    
});
