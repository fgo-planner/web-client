import { GameItem } from '@fgo-planner/types';
import { InputBaseComponentProps, TextField } from '@mui/material';
import React, { ChangeEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import NumberFormat from 'react-number-format';
import { StaticListRowContainer } from '../../../../components/list/static-list-row-container.component';
import { GameItemConstants } from '../../../../constants';
import { Immutable } from '../../../../types/internal';
import { MathUtils } from '../../../../utils/math.utils';
import { MasterItemListRowLabel } from './master-item-list-row-label.component';

type Props = {
    editMode: boolean;
    gameItem: Immutable<GameItem>;
    onChange: (itemId: number, quantity: number) => void;
    quantity: number;
};

const QuantityInputProps: InputBaseComponentProps = {
    step: 1,
    min: 0,
    max: GameItemConstants.MaxItemQuantity
};

export const StyleClassPrefix = 'MasterItemListRow';

export const MasterItemListRow = React.memo((props: Props) => {

    const {
        editMode,
        gameItem,
        onChange,
        quantity
    } = props;

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
        const quantity = MathUtils.clamp(~~Number(value), 0, GameItemConstants.MaxItemQuantity);
        onChange(gameItem._id, quantity);
    }, [gameItem._id, onChange]);

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
                variant='outlined'
                size='small'
                type='number'
                inputProps={QuantityInputProps}
                value={quantity}
                onChange={handleItemQuantityChange}
                onFocus={handleItemQuantityFocus}
                onBlur={handleItemQuantityBlur}
            />
        );
    } else {
        itemQuantityNode = (
            <NumberFormat
                value={quantity}
                displayType='text'
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
            <MasterItemListRowLabel gameItem={gameItem} editMode={editMode} />
            <div className='flex-fill' />
            <div>
                {itemQuantityNode}
            </div>
        </StaticListRowContainer>
    );

});
