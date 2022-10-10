import { MasterServantUpdateBoolean, MasterServantUpdateIndeterminateValue as IndeterminateValue } from '@fgo-planner/data-core';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { MouseEvent, useCallback } from 'react';

type Props = {
    disabled?: boolean;
    label?: string;
    multiEditMode?: boolean;
    name: string;
    onChange: (name: string, value: MasterServantUpdateBoolean, pushChanges: boolean) => void;
    value: MasterServantUpdateBoolean;
};

const DefaultLabel = 'Servant is summoned';

// This component does not need StyleClassPrefix.

const StyleProps = {
    alignItems: 'start',
    px: 2,
    pt: 1
} as SystemStyleObject<Theme>;

/**
 * Checkbox for toggling a servant's `summoned` flag. This is currently only
 * applicable to master servants.
 */
export const MasterServantSummonedCheckbox = React.memo((props: Props) => {

    const {
        disabled,
        label,
        multiEditMode,
        name,
        onChange,
        value
    } = props;

    const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        /**
         * Find the next value in the cycle. The possible values depends on the value of `multiEditMode`:
         * 
         * `multiEditMode` is truthy: `false` -> `true` -> `IndeterminateValue`
         *
         * `multiEditMode` is falsy: `false` -> `true`
         */
        /** */
        let nextValue: MasterServantUpdateBoolean;
        switch (value) {
            case MasterServantUpdateBoolean.True:
                nextValue = multiEditMode ? MasterServantUpdateBoolean.Indeterminate : MasterServantUpdateBoolean.False;
                break;
            case MasterServantUpdateBoolean.False:
                nextValue = MasterServantUpdateBoolean.True;
                break;
            default:
                nextValue = multiEditMode ? MasterServantUpdateBoolean.False : MasterServantUpdateBoolean.True;
                break;
        }
        onChange(name, nextValue, true);
    }, [multiEditMode, name, onChange, value]);

    const checkboxNode = (
        <Checkbox
            name={name}
            indeterminate={value === IndeterminateValue}
            checked={!!value}
            onClick={handleClick}
            disabled={disabled}
        />
    );

    return (
        <FormGroup sx={StyleProps}>
            <FormControlLabel
                control={checkboxNode}
                label={label || DefaultLabel}
            />
        </FormGroup>
    );

});
