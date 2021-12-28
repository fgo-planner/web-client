import { GameItem, GameItemQuantity } from '@fgo-planner/types';
import { InputBaseComponentProps, TextField } from '@mui/material';
import React, { ChangeEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
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

    const [active, setActive] = useState<boolean>(false);

    const itemQuantityInputRef = useRef<HTMLInputElement | null>(null);

    /*
     * Deactivate row when editMode flag changes, regardless of what it changes to.
     */
    useEffect(() => {
        setActive(false);
    }, [editMode]);

    const handleItemQuantityChange = useCallback((event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const value = event.target.value;
        const quantity = MathUtils.clamp(~~Number(value), 0, MaxItemQuantity);

        // TODO Is it bad practice to modify an object in props?
        item.masterData.quantity = quantity;

        forceUpdate();
    }, [item, forceUpdate]);

    const handleItemQuantityFocus = useCallback((): void => {
        setActive(true);
    }, []);

    const handleItemQuantityBlur = useCallback((): void => {
        setActive(false);
    }, []);

    const handleRowClick = useCallback((): void => {
        if (!editMode) {
            return;
        }
        itemQuantityInputRef.current?.focus();
    }, [editMode]);

    let itemQuantityNode: ReactNode;
    if (editMode) {
        itemQuantityNode = (
            <TextField
                inputRef={itemQuantityInputRef}
                variant="outlined"
                size="small"
                type="number"
                inputProps={QuantityInputProps}
                value={item.masterData.quantity}
                onChange={handleItemQuantityChange}
                onFocus={handleItemQuantityFocus}
                onBlur={handleItemQuantityBlur}
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
        <StaticListRowContainer
            className={`${StyleClassPrefix}-root`}
            onClick={handleRowClick}
            active={active}
            borderTop
        >
            <MasterItemListRowLabel item={item.item} editMode={editMode} />
            <div className="flex-fill" />
            <div>
                {itemQuantityNode}
            </div>
        </StaticListRowContainer>
    );

});
