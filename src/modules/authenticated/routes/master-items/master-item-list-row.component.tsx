import { InputBaseComponentProps, makeStyles, StyleRules, TextField, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { ChangeEvent, ReactNode, useCallback } from 'react';
import NumberFormat from 'react-number-format';
import { StaticListRowContainer } from '../../../../components/list/static-list-row-container.component';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { GameItem, GameItemQuantity } from '../../../../types';
import { MathUtils } from '../../../../utils/math.utils';
import { MasterItemListRowLabel } from './master-item-list-row-label.component';

type ListViewDataItem = { item: GameItem; masterData: GameItemQuantity };

type Props = {
    key: number;
    item: ListViewDataItem;
    editMode: boolean;
};

const MaxItemQuantity = 999999999; // TOOD Move this to constants file.

const QuantityInputProps: InputBaseComponentProps = {
    step: 1,
    min: 0,
    max: MaxItemQuantity
};

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        alignContent: 'center',
        alignItems: 'center',
        height: 52,
        padding: theme.spacing(0, 8, 0, 4),
        fontSize: '0.875rem'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterItemListRow'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterItemListRow = React.memo(({ key, item, editMode }: Props) => {

    const forceUpdate = useForceUpdate();

    const classes = useStyles();

    const handleItemQuantityChange = useCallback((event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const value = event.target.value;
        const quantity = MathUtils.clamp(~~Number(value), 0, MaxItemQuantity);

        // TODO Is it bad practice to modify an object in props?
        item.masterData.quantity = quantity;

        forceUpdate();
    }, [item, forceUpdate]);

    let itemQuantityNode: ReactNode;
    if (editMode) {
        itemQuantityNode = (
            <TextField
                variant="outlined"
                size="small"
                type="number"
                inputProps={QuantityInputProps}
                value={item.masterData.quantity}
                onChange={handleItemQuantityChange}
            />
        );
    } else {
        itemQuantityNode = (
            <NumberFormat
                value={item.masterData.quantity}
                displayType="text"
                thousandSeparator={true}
            />
        );
    }

    return (
        <StaticListRowContainer borderTop>
            <div className={classes.root} key={key}>
                <MasterItemListRowLabel item={item.item} editMode={editMode} />
                <div className="flex-fill" />
                <div>
                    {itemQuantityNode}
                </div>
            </div>
        </StaticListRowContainer>
    );

});
