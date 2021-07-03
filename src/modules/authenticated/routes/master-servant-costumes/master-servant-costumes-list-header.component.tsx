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
    thumbnail: {
        width: 48
    },
    collectionNo: {
        width: 64,
        textAlign: 'center'
    },
    name: {
        flex: 1
    },
    unlockMaterials: {
        width: 295,
        paddingRight: theme.spacing(24),
        textAlign: 'center'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantCostumesListHeader'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterServantCostumesListHeader = React.memo(() => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <div className={classes.unlockedStatus}>
                <LockOpen fontSize="small" />
            </div>
            <div className={classes.thumbnail} />
            <div className={classes.collectionNo}>
                No.
            </div>
            <div className={classes.name}>
                Costume Name
            </div>
            <div className={classes.unlockMaterials}>
                Unlock Materials
            </div>
            <div className={classes.preview} />
        </div>
    );
});
