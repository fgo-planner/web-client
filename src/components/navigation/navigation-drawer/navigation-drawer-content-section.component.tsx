import { Divider } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React from 'react';
import { ThemeConstants } from '../../../styles/theme-constants';
import { NavigationDrawerSection as Section, Supplier } from '../../../types/internal';
import { NavigationDrawerContentItem } from './navigation-drawer-content-item.component';

type Props = {
    expanded?: boolean;
    hideDivider?: boolean;
    mobileView?: boolean;
    onClose: Supplier<void>;
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
        expanded,
        hideDivider,
        mobileView,
        onClose,
        section: {
            items
        }
    } = props;

    const itemNodes = items.map(item => (
        <NavigationDrawerContentItem
            key={item.key}
            item={item}
            onClose={onClose}
            mobileView={mobileView}
            expanded={expanded}
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
