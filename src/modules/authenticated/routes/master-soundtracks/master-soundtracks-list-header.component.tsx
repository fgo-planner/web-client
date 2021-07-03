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
        paddingRight: theme.spacing(ThemeConstants.ScrollbarWidthScale),
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontWeight: 500,
        fontSize: '0.875rem',
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: theme.palette.divider,
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
        textAlign: 'right'
    },
    preview: {
        width: 48 + theme.spacing(24 + 4)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterSoundtracksListHeader'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterSoundtracksListHeader = React.memo(() => {
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
                Unlock Material
            </div>
            <div className={classes.preview} />
        </div>
    );
});
