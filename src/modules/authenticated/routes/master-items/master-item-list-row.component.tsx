import { GameItem } from '@fgo-planner/types';
import { InputBaseComponentProps, TextField } from '@mui/material';
import React, { FocusEvent, useCallback, useRef, useState } from 'react';
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

const BaseQuantityInputProps: InputBaseComponentProps = {
    step: 1,
    min: 0,
    max: GameItemConstants.MaxItemQuantity
};

const ActiveQuantityInputProps: InputBaseComponentProps = {
    ...BaseQuantityInputProps,
    type: 'number'
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

    const [quantityInputProps, setQuantityInputProps] = useState<InputBaseComponentProps>(BaseQuantityInputProps);
    
    const itemQuantityInputRef = useRef<HTMLInputElement | null>(null);

    const handleItemQuantityChange = useCallback((values: NumberFormatValues, sourceInfo: SourceInfo): void => {
        const value = Math.floor(values.floatValue || 0);
        const quantity = MathUtils.clamp(value, 0, GameItemConstants.MaxItemQuantity);
        onChange(gameItem._id, quantity);
    }, [gameItem._id, onChange]);

    const handleItemQuantityFocus = useCallback((event: FocusEvent<HTMLInputElement>): void => {
        setActive(true);
        /*
         * The following actions need to be executed with a delay, hence the setTimeout:
         *
         * - Update the input props to set the type to 'numeric'. This needs to be
         *   delayed to give the thousandSeparator property change a chance to take
         *   effect first.
         *
         * - Reselect the input text again due to the numerical value being unformatted
         *   on initial focus, which causes the text to be deselected.
         */
        setTimeout(() => {
            setQuantityInputProps(ActiveQuantityInputProps);
            event.target.select();
        });
    }, []);

    const handleItemQuantityBlur = useCallback((): void => {
        setActive(false);
        /*
         * Unlike when focusing the input field, the type needs to be changed back to
         * 'text' before the thousandSeparator property change takes effect, so we 
         * don't use setTimeout here.
         */
        setQuantityInputProps(BaseQuantityInputProps);
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
            inputProps={quantityInputProps}
            value={String(quantity)}
            thousandSeparator={!active}
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
