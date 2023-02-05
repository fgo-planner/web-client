import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React from 'react';
import { HeaderLabel } from '../../../../../../components/text/HeaderLabel';

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
        [breakpoints.down('sm')]: {
            pr: 6
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterItemListHeader = React.memo(({ categoryLabel, showQuantityLabel }: Props) => (
    <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
        <HeaderLabel>{categoryLabel}</HeaderLabel>
        {showQuantityLabel && <HeaderLabel>Quantity</HeaderLabel>}
    </Box>
));
