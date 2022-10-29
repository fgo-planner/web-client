import { Immutable, MathUtils } from '@fgo-planner/common-core';
import { GameItem, GameItemConstants, MasterAccountConstants, MasterItemConstants } from '@fgo-planner/data-core';
import { TextField } from '@mui/material';
import React, { ChangeEvent, KeyboardEvent, KeyboardEventHandler, SetStateAction, useCallback, useMemo, useRef, useState } from 'react';
import { DataTableListStaticRow } from '../../../../components/data-table-list/data-table-list-static-row.component';
import { NumberFormatUtils } from '../../../../utils/format/number-format-utils';
import { MasterItemListRowLabel } from './master-item-list-row-label.component';

type Props = {
    gameItem: Immutable<GameItem>;
    onChange: (itemId: number, action: SetStateAction<number>) => void;
    quantity: number;
};

const InputFilterRegex = new RegExp(/\D/g);

export const StyleClassPrefix = 'MasterItemListRow';

export const MasterItemListRow = React.memo((props: Props) => {

    const {
        gameItem,
        onChange,
        quantity
    } = props;

    const [active, setActive] = useState<boolean>(false);

    const itemQuantityInputRef = useRef<HTMLInputElement | null>(null);

    const itemId = gameItem._id;

    const maxValue = itemId === GameItemConstants.QpItemId ?
        MasterAccountConstants.MaxQp :
        MasterItemConstants.MaxQuantity;

    const handleItemQuantityChange2 = useCallback(({ target }: ChangeEvent<HTMLInputElement>): void => {
        const { value } = target;
        const filteredValue = value.replaceAll(InputFilterRegex, '');
        const quantity = MathUtils.clamp(Number(filteredValue), 0, maxValue);
        onChange(itemId, Number(quantity));
    }, [itemId, maxValue, onChange]);

    const handleItemQuantityFocus = useCallback((): void => {
        setActive(true);
    }, []);

    const handleItemQuantityBlur = useCallback((): void => {
        setActive(false);
    }, []);

    const handleRowClick = useCallback((): void => {
        itemQuantityInputRef.current?.focus();
    }, []);

    /**
     * Increments or decrements the quantity if the `ArrowUp` or `ArrowDown` is
     * pressed, respectively. Function is unbound (`undefined`) if the item row is
     * not active.
     */
    const handleKeyDown = useMemo((): KeyboardEventHandler<HTMLDivElement> | undefined => {
        if (!active) {
            return undefined;
        }
        return (event: KeyboardEvent<HTMLDivElement>): void => {
            const { key } = event;
            let change: number;
            if (key === 'ArrowUp') {
                change = 1;
            } else if (key === 'ArrowDown') {
                change = -1;
            } else {
                return;
            }
            event.preventDefault();
            onChange(itemId, (quantity) => quantity + change);
        };
    }, [active, itemId, onChange]);

    const itemQuantityInputNode = (
        <TextField
            inputRef={itemQuantityInputRef}
            variant='outlined'
            size='small'
            type='tel'
            value={NumberFormatUtils.formatQuantity(quantity)}
            onChange={handleItemQuantityChange2}
            onFocus={handleItemQuantityFocus}
            onBlur={handleItemQuantityBlur}
            onKeyDown={handleKeyDown}
        />
    );

    return (
        <DataTableListStaticRow
            className={`${StyleClassPrefix}-root`}
            onClick={handleRowClick}
            active={active}
            borderTop
        >
            <MasterItemListRowLabel gameItem={gameItem} />
            <div className='flex-fill' />
            <div>
                {itemQuantityInputNode}
            </div>
        </DataTableListStaticRow>
    );

});
