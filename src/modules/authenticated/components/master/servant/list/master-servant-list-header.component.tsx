import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';
import React from 'react';
import { ThemeConstants } from '../../../../../../styles/theme-constants';
import { ViewModeColumnWidths } from './master-servant-list-column-widths';

type Props = {
    editMode?: boolean;
    showActions?: boolean;
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
        flex: ViewModeColumnWidths.label
    },
    npLevel: {
        flex: ViewModeColumnWidths.npLevel
    },
    level: {
        flex: ViewModeColumnWidths.level
    },
    fouHp: {
        flex: ViewModeColumnWidths.fouHp
    },
    fouAtk: {
        flex: ViewModeColumnWidths.fouAtk
    },
    skillLevels: {
        flex: ViewModeColumnWidths.skillLevels
    },
    bondLevel: {
        flex: ViewModeColumnWidths.bondLevel
    },
    actions: {
        width: ViewModeColumnWidths.actions
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantListHeader'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterServantListHeader = React.memo(({ editMode, showActions }: Props) => {
    const classes = useStyles();
    const rootClassName = clsx(classes.root, editMode && classes.editMode);
    return (
        <div className={rootClassName}>
            <div className={classes.label}>
                Servant
            </div>
            <div className={classes.npLevel}>
                NP
            </div>
            <div className={classes.level}>
                Level
            </div>
            <div className={classes.fouHp}>
                Fou (HP)
            </div>
            <div className={classes.fouAtk}>
                Fou (Attack)
            </div>
            <div className={classes.skillLevels}>
                Skills
            </div>
            <div className={classes.bondLevel}>
                Bond
            </div>
            {showActions && <div className={classes.actions}>
                Actions
            </div>}
        </div>
    );
});
