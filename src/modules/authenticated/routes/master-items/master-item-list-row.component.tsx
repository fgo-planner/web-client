import { GameItem } from '@fgo-planner/types';
import { InputBaseComponentProps, TextField } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';
import NumberFormat, { NumberFormatValues, SourceInfo } from 'react-number-format';
import { StaticListRowContainer } from '../../../../components/list/static-list-row-container.component';
import { GameItemConstants } from '../../../../constants';
import { Immutable } from '../../../../types/internal';
import { MathUtils } from '../../../../utils/math.utils';
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
    max: GameItemConstants.MaxItemQuantity,
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
        const quantity = MathUtils.clamp(value, 0, GameItemConstants.MaxItemQuantity);
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
        <StaticListRowContainer
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
        </StaticListRowContainer>
    );

});
