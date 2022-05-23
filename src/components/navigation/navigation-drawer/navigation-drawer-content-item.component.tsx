import { Button, Theme, Tooltip } from '@mui/material';
import { Box, SystemStyleObject } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavigationDrawerActionItem as ActionItem, NavigationDrawerItem as Item, NavigationDrawerLinkItem as LinkItem, Supplier, SxPropsFunction } from '../../../types/internal';

type Props = {
    expanded?: boolean;
    item: Item;
    mobileView?: boolean;
    onClose: Supplier<void>;
};

const TooltipEnterDelay = 250;

const TooltipLeaveDelay = 0;

const StyleClassPrefix = 'NavigationDrawerContentItem';

const StyleProps = ((theme: Theme) => {

    const {
        palette,
        spacing,
        transitions
    } = theme;

    return {
        width: '100%',
        height: spacing(12),
        px: 2,
        my: 2,
        boxSizing: 'border-box',
        // transition:
        [`& .${StyleClassPrefix}-button`]: {
            minWidth: 'initial',
            width: '100%',
            height: spacing(12),
            borderRadius: spacing(6),
            alignItems: 'center',
            justifyContent: 'start',
            transition: 'none',
            [`& .${StyleClassPrefix}-icon`]: {
                fontSize: '1.875rem'
            },
            [`& .${StyleClassPrefix}-label`]: {
                pl: 3,
                // fontWeight: 'normal',
                fontSize: '1rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'clip'
            }
        },
        [`&.${StyleClassPrefix}-condensed`]: {
            [`& .${StyleClassPrefix}-icon`]: {
                mx: 0.25,
                transition: `margin ${transitions.duration.leavingScreen}ms ${transitions.easing.sharp}`
            },
            [`& .${StyleClassPrefix}-icon, .${StyleClassPrefix}-label`]: {
                color: palette.drawer?.contrastText
            }
        },
        [`&.${StyleClassPrefix}-expanded`]: {
            [`& .${StyleClassPrefix}-icon`]: {
                mx: 3,
                transition: `margin ${transitions.duration.enteringScreen}ms ${transitions.easing.easeOut}`
            },
            [`& .${StyleClassPrefix}-icon, .${StyleClassPrefix}-label`]: {
                color: palette.text.primary // TODO Might have to use a contrast text color for this
            }
        },
        [`&.${StyleClassPrefix}-active`]: {
            [`& .${StyleClassPrefix}-label`]: {
                fontWeight: '500'
            },
            [`& .${StyleClassPrefix}-icon, .${StyleClassPrefix}-label`]: {
                color: palette.primary.main
            }
        }
    } as SystemStyleObject;
    
}) as SxPropsFunction;

export const NavigationDrawerContentItem = React.memo((props: Props) => {

    const {
        expanded,
        item,
        mobileView,
        onClose
    } = props;

    const {
        activeIcon,
        icon,
        label,
        tooltip
    } = item;

    const location = useLocation();
    const navigate = useNavigate();

    const isLink = !!(item as LinkItem).route;

    const handleClick = useCallback((event: MouseEvent<HTMLElement>) => {
        event.preventDefault();
        if (isLink) {
            navigate((item as LinkItem).route);
            /*
             * Also close the drawer if in mobile view.
             */
            if (mobileView) {
                onClose();
            }
        } else {
            (item as ActionItem).onClick(event);
        }
    }, [isLink, item, mobileView, navigate, onClose]);

    const isLinkActive = useMemo(() => {
        if (!isLink) {
            return false;
        }
        const { route, exact } = item as LinkItem;
        if (exact) {
            return location?.pathname === route;
        } else {
            return location?.pathname.startsWith(route);
        }
    }, [isLink, item, location?.pathname]);

    const tooltipText = useMemo((): string => {
        if (expanded) {
            return '';
        }
        return tooltip ?? label;
    }, [expanded, label, tooltip]);

    const Icon = (isLinkActive && activeIcon) || icon;

    const className = clsx(
        `${StyleClassPrefix}-root`,
        expanded ? `${StyleClassPrefix}-expanded` : `${StyleClassPrefix}-condensed`,
        isLinkActive && `${StyleClassPrefix}-active`
    );

    return (
        <Box className={className} sx={StyleProps}>
            <Tooltip
                placement='right'
                title={tooltipText}
                enterDelay={TooltipEnterDelay}
                leaveDelay={TooltipLeaveDelay}
            >
                <Button
                    className={`${StyleClassPrefix}-button`}
                    onClick={handleClick}
                    href={(item as LinkItem).route}
                >
                    <Icon className={`${StyleClassPrefix}-icon`} fontSize='medium' />
                    {expanded && <div className={`${StyleClassPrefix}-label`}>
                        {label}
                    </div>}
                </Button>
            </Tooltip>
        </Box>
    );

});