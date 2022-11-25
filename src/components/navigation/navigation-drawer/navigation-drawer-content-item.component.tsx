import { Button, Theme, Tooltip } from '@mui/material';
import { Box, SystemStyleObject } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, useCallback, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavigationDrawerContext } from '../../../contexts/navigation-drawer.context';
import { NavigationDrawerActionItem as ActionItem, NavigationDrawerItem as Item, NavigationDrawerLinkItem as LinkItem, SxPropsFunction } from '../../../types';

type Props = {
    item: Item;
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
                fontSize: '1.75rem'
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
                mx: 0.5,
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
        },
        [`&.${StyleClassPrefix}-no-animations .${StyleClassPrefix}-icon`]: {
            transition: 'none !important'
        }
    } as SystemStyleObject;
    
}) as SxPropsFunction;

export const NavigationDrawerContentItem = React.memo(({ item }: Props) => {

    const location = useLocation();
    const navigate = useNavigate();

    const {
        activeIcon,
        icon,
        label,
        tooltip
    } = item;

    const {
        animationsDisabled,
        expanded,
        mobileView,
        onClose
    } = useContext(NavigationDrawerContext);

    const isLink = !!(item as LinkItem).route;

    const handleClick = useCallback((event: MouseEvent<HTMLElement>) => {
        event.preventDefault();
        if (isLink) {
            /*
             * If an onClick handler was provided, then call it instead of navigating the
             * user to the route. In this case, the route path is only used to determine
             * the active status of the link.
             */
            if (item.onClick) {
                item.onClick(event);
            } else {
                navigate((item as LinkItem).route);
            }
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
        animationsDisabled && `${StyleClassPrefix}-no-animations`,
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
                    <Icon className={`${StyleClassPrefix}-icon`} />
                    {expanded && <div className={`${StyleClassPrefix}-label`}>
                        {label}
                    </div>}
                </Button>
            </Tooltip>
        </Box>
    );

});
