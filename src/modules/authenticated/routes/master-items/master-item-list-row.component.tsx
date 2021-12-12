import { GameItem, GameItemQuantity } from '@fgo-planner/types';
import { InputBaseComponentProps, TextField } from '@mui/material';
import React, { ChangeEvent, ReactNode, useCallback } from 'react';
import NumberFormat from 'react-number-format';
import { StaticListRowContainer } from '../../../../components/list/static-list-row-container.component';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { MathUtils } from '../../../../utils/math.utils';
import { MasterItemListRowLabel } from './master-item-list-row-label.component';

type ListViewDataItem = { item: GameItem; masterData: GameItemQuantity };

type Props = {
    item: ListViewDataItem;
    editMode: boolean;
};

const MaxItemQuantity = 2000000000; // TOOD Move this to constants file.

const QuantityInputProps: InputBaseComponentProps = {
    step: 1,
    min: 0,
    max: MaxItemQuantity
};

export const StyleClassPrefix = 'MasterItemListRow';

export const MasterItemListRow = React.memo(({ item, editMode }: Props) => {

    const forceUpdate = useForceUpdate();

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
        <StaticListRowContainer className={`${StyleClassPrefix}-root`} borderTop>
            <MasterItemListRowLabel item={item.item} editMode={editMode} />
            <div className="flex-fill" />
            <div>
                {itemQuantityNode}
            </div>
        </StaticListRowContainer>
    );

});
