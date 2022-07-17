import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React from 'react';
import { ThemeConstants } from '../../../../styles/theme-constants';

type Props = {
    categoryLabel: string;
    showQuantityLabel?: boolean;
    viewLayout?: any; // TODO Make use of this
};

const StyleClassPrefix = 'MasterItemListHeader';

const StyleProps = (theme: SystemTheme) => {

    const { breakpoints } = theme as Theme;

    return {
        display: 'flex',
        justifyContent: 'space-between',
        px: 6,
        pr: 8,
        py: 4,
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontWeight: 500,
        fontSize: '0.9375rem',
        [breakpoints.down('sm')]: {
            pr: 6
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterItemListHeader = React.memo(({ categoryLabel, showQuantityLabel }: Props) => (
    <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
        <div>
            {categoryLabel}
        </div>
        {showQuantityLabel && <div>Quantity</div>}
    </Box>
));
