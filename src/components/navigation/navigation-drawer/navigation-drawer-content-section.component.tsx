import { Divider } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { useContext } from 'react';
import { NavigationDrawerContext } from '../../../contexts/navigation-drawer.context';
import { ThemeConstants } from '../../../styles/theme-constants';
import { NavigationDrawerSection as Section } from '../../../types/internal';
import { NavigationDrawerContentItem } from './navigation-drawer-content-item.component';

type Props = {
    hideDivider?: boolean;
    section: Section;
};

const StyleClassPrefix = 'NavigationDrawerContentSection';

const StyleProps = (theme: Theme) => ({
    [`&.${StyleClassPrefix}-condensed`]: {
        width: theme.spacing(ThemeConstants.NavigationDrawerCondensedWidthScale),
    },
    [`&.${StyleClassPrefix}-expanded`]: {
        width: theme.spacing(ThemeConstants.NavigationDrawerExpandedWidthScale)
    }
} as SystemStyleObject<Theme>);

export const NavigationDrawerContentSection = React.memo((props: Props) => {

    const {
        hideDivider,
        section: {
            items
        }
    } = props;

    const { expanded } = useContext(NavigationDrawerContext);

    const itemNodes = items.map(item => (
        <NavigationDrawerContentItem
            key={item.key}
            item={item}
        />
    ));

    const className = clsx(
        `${StyleClassPrefix}-root`,
        expanded ? `${StyleClassPrefix}-expanded` : `${StyleClassPrefix}-condensed`
    );

    return (
        <Box className={className} sx={StyleProps}>
            {!hideDivider && <Divider />}
            {itemNodes}
        </Box>
    );

});
