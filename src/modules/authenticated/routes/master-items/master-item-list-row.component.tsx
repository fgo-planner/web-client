import { Immutable, MathUtils } from '@fgo-planner/common-core';
import { GameItem, MasterItemConstants } from '@fgo-planner/data-core';
import { InputBaseComponentProps, TextField } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';
import NumberFormat, { NumberFormatValues, SourceInfo } from 'react-number-format';
import { DataTableListStaticRow } from '../../../../components/data-table-list/data-table-list-static-row.component';
import { MasterItemListRowLabel } from './master-item-list-row-label.component';

type Props = {
    gameItem: Immutable<GameItem>;
    onChange: (itemId: number, quantity: number) => void;
    quantity: number;
};

const QuantityInputProps: InputBaseComponentProps = {
    type: 'tel',
    step: 1,
    min: 0,
    max: MasterItemConstants.MaxQuantity,
};

const isQuantityValueAllowed = ({floatValue}: NumberFormatValues): boolean => {
    if (floatValue === undefined) {
        return true;
    }
    return floatValue >= 0 && floatValue <= 9_999_999_999;
};

export const StyleClassPrefix = 'MasterItemListRow';

export const MasterItemListRow = React.memo((props: Props) => {

    const {
        gameItem,
        onChange,
        quantity
    } = props;

    const [active, setActive] = useState<boolean>(false);

    const itemQuantityInputRef = useRef<HTMLInputElement | null>(null);

    const handleItemQuantityChange = useCallback((values: NumberFormatValues, sourceInfo: SourceInfo): void => {
        const value = Math.floor(values.floatValue || 0);
        const quantity = MathUtils.clamp(value, 0, MasterItemConstants.MaxQuantity);
        onChange(gameItem._id, quantity);
    }, [gameItem._id, onChange]);

    const handleItemQuantityFocus = useCallback((): void => {
        setActive(true);
    }, []);

    const handleItemQuantityBlur = useCallback((): void => {
        setActive(false);
    }, []);

    const handleRowClick = useCallback((): void => {
        itemQuantityInputRef.current?.focus();
    }, []);

    const itemQuantityInputNode = (
        <NumberFormat
            customInput={TextField}
            inputRef={itemQuantityInputRef}
            variant='outlined'
            size='small'
            inputProps={QuantityInputProps}
            value={String(quantity)}
            thousandSeparator
            isNumericString
            isAllowed={isQuantityValueAllowed}
            onValueChange={handleItemQuantityChange}
            onFocus={handleItemQuantityFocus}
            onBlur={handleItemQuantityBlur}
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
