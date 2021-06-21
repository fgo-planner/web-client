import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { LockOpen } from '@material-ui/icons';
import React from 'react';
import { ThemeConstants } from '../../../../styles/theme-constants';

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        height: 52,
        alignItems: 'center',
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontWeight: 500,
        fontSize: '0.875rem'
    },
    unlockedStatus: {
        width: 42,
        padding: theme.spacing(0, 2),
        textAlign: 'center'
    },
    thumbnailContainer: {
        width: 96 + theme.spacing(6)
    },
    title: {
        flex: 1
    },
    unlockMaterial: {
        textAlign: 'right',
        width: 28 + theme.spacing(3) + 42
    },
    preview: {
        width: 48 + 2 * theme.spacing(1)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterSoundtrackListHeader'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterSoundtrackListHeader = React.memo(() => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <div className={classes.unlockedStatus}>
                <LockOpen fontSize="small" />
            </div>
            <div className={classes.thumbnailContainer} />
            <div className={classes.title}>
                Track Title
            </div>
            <div className={classes.unlockMaterial}>
                Cost
            </div>
            <div className={classes.preview} />
        </div>
    );
});
