import clsx from 'clsx';
import React, { MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
    active?: boolean;
    label: ReactNode;
    route?: string;
    onClick?: MouseEventHandler;
    onMouseOver?: MouseEventHandler;
    onMouseOut?: MouseEventHandler;
};

export const StyleClassPrefix = 'AppBarLink';

export const AppBarLink = React.memo((props: Props) => {

    const {
        active,
        route,
        label,
        onClick,
        onMouseOver,
        onMouseOut
    } = props;

    const className = clsx(`${StyleClassPrefix}-root`, active && 'active');

    // If route path was defined, then render it as a Link.
    if (route) {
        return (
            <Link
                className={className}
                to={route}
                onClick={onClick}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
            >
                {label}
            </Link>
        );
    }

    // Otherwise, render it as a div.
    return (
        <div
            className={className}
            onClick={onClick}
            onMouseEnter={onMouseOver}
            onMouseLeave={onMouseOut}
        >
            {label}
        </div>
    );

});
