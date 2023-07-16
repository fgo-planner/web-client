import { alpha, Typography } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LayoutPanel } from '../../../components/layout/LayoutPanel';
import { ThemeConstants } from '../../../styles/ThemeConstants';

type Props = {
    imageUrl?: string;
    onClick?: MouseEventHandler;
    title: string;
    to?: string;
    subtitle?: string;
};

const Height = 84;

const StyleClassPrefix = 'HomeRouteLink';

const StyleProps = (theme: Theme) => ({
    // width: 448,
    flex: '50%',
    maxWidth: '50%',
    p: 3,
    boxSizing: 'border-box',
    cursor: 'pointer',
    textDecoration: 'none',
    [theme.breakpoints.down('md')]: {
        flex: '100%',
        maxWidth: '100%'
    },
    [`& .${StyleClassPrefix}-content`]: {
        display: 'flex',
        alignItems: 'center',
        height: Height
    },
    [`& .${StyleClassPrefix}-thumbnail`]: {
        height: Height
    },
    [`& .${StyleClassPrefix}-title`]: {
        pl: 6
    },
    [`& .${StyleClassPrefix}-subtitle`]: {
        fontFamily: ThemeConstants.FontFamilyRoboto,
        pl: 4
    },
    '&:hover': {
        [`& .${StyleClassPrefix}-content`]: {
            backgroundColor: alpha(theme.palette.primary.main, 0.07)
        },
        [`& .${StyleClassPrefix}-title`]: {
            // color: theme.palette.primary.main
        }
    }
} as SystemStyleObject<Theme>);

export const HomeRouteLink = React.memo((props: Props) => {

    const {
        imageUrl,
        onClick,
        title,
        to
    } = props;

    const contentNode: ReactNode = (
        <LayoutPanel>
            <div className={`${StyleClassPrefix}-content`}>
                {imageUrl && <img
                    className={`${StyleClassPrefix}-thumbnail`}
                    src={imageUrl}
                    alt=''
                />}
                <div>
                    <Typography className={`${StyleClassPrefix}-title`} variant='h5' color='primary'>
                        {title}
                    </Typography>
                </div>
            </div>
        </LayoutPanel>
    );

    if (to) {
        return (
            <Box
                component={Link}
                className={`${StyleClassPrefix}-root`}
                sx={StyleProps}
                to={to}
            >
                {contentNode}
            </Box>
        );
    }

    return (
        <Box
            className={`${StyleClassPrefix}-root`}
            sx={StyleProps}
            onClick={onClick}
        >
            {contentNode}
        </Box>
    );

});
