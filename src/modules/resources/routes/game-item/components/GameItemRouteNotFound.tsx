import React from 'react';

type Props = {
    itemId: number | string | undefined;
};

export const GameItemRouteNotFound = React.memo((props: Props) => (
    <>{`Item '${props.itemId}' could not be found.`}</>
));
