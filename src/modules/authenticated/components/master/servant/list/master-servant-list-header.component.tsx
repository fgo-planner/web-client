import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';
import React from 'react';
import { ThemeConstants } from '../../../../../../styles/theme-constants';
import { ReadonlyPartial } from '../../../../../../types';
import { MasterServantListColumnWidths as ColumnWidths, MasterServantListVisibleColumns } from './master-servant-list-columns';

type Props = {
    editMode?: boolean;
    visibleColumns?: ReadonlyPartial<MasterServantListVisibleColumns>;
    viewLayout?: any; // TODO Make use of this
};

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        padding: theme.spacing(4, 0, 4, 4),
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: theme.palette.divider,
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontWeight: 500,
        textAlign: 'center',
        fontSize: '0.875rem'
    },
    editMode: {
        paddingLeft: theme.spacing(4 + 5)
    },
    label: {
        flex: ColumnWidths.label
    },
    npLevel: {
        flex: ColumnWidths.npLevel
    },
    level: {
        flex: ColumnWidths.level
    },
    fouHp: {
        flex: ColumnWidths.fouHp
    },
    fouAtk: {
        flex: ColumnWidths.fouAtk
    },
    skillLevels: {
        flex: ColumnWidths.skillLevels
    },
    bondLevel: {
        flex: ColumnWidths.bondLevel
    },
    actions: {
        width: ColumnWidths.actions
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantListHeader'
};

const useStyles = makeStyles(style, styleOptions);

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

    const classes = useStyles();

    const rootClassName = clsx(classes.root, editMode && classes.editMode);

    return (
        <div className={rootClassName}>
            <div className={classes.label}>
                Servant
            </div>
            {npLevel &&
                <div className={classes.npLevel}>
                    NP
                </div>
            }
            {level &&
                <div className={classes.level}>
                    Level
                </div>
            }
            {fouHp &&
                <div className={classes.fouHp}>
                    Fou (HP)
                </div>
            }
            {fouAtk &&
                <div className={classes.fouAtk}>
                    Fou (ATK)
                </div>
            }
            {skillLevels &&
                <div className={classes.skillLevels}>
                    Skills
                </div>
            }
            {bondLevel &&
                <div className={classes.bondLevel}>
                    Bond
                </div>
            }
            {actions &&
                <div className={classes.actions}>
                    Actions
            </div>}
        </div>
    );
});
