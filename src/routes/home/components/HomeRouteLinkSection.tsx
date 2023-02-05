import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { PropsWithChildren, ReactNode } from 'react';
import { PageTitle } from '../../../components/text/PageTitle';

type Props = PropsWithChildren<{
    title?: ReactNode;
}>;

const StyleClassPrefix = 'HomeRouteLinkSection';

const StyleProps = (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    [`& .${StyleClassPrefix}-container`]: {
        display: 'flex',
        flexWrap: 'wrap',
        // justifyContent: 'center',
        width: theme.breakpoints.values.md,
        [theme.breakpoints.down('md')]: {
            width: '100vw'
        }
    }
} as SystemStyleObject<Theme>);

export const HomeRouteLinkSection = React.memo((props: Props) => {
    
    const {
        title,
        children
    } = props;

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {title && <PageTitle children={title} />}
            <div className={`${StyleClassPrefix}-container`}>
                {children}
            </div>
        </Box>
    );

});
