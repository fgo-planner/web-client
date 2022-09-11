import { MasterServantUpdateIndeterminate as Indeterminate, MasterServantUpdateIndeterminateValue as IndeterminateValue } from '@fgo-planner/data-core';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { MouseEvent, useCallback } from 'react';

type Props = {
    disabled?: boolean;
    label?: string;
    multiEditMode?: boolean;
    name: string;
    onChange: (name: string, value: boolean | Indeterminate, pushChanges: boolean) => void;
    value: boolean | Indeterminate;
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
         * The next value in the cycle. The possible values depends on the whether
         * `multiEditMode` is `true` or not:
         *
         * If `true`, the possible values are: `false` -> `true` -> `IndeterminateValue`.
         *
         * Else, the possible values are: `false` -> `true`.
         */
        let nextValue: boolean | Indeterminate;
        switch (value) {
            case IndeterminateValue:
                nextValue = multiEditMode ? false : true;
                break;
            case false:
                nextValue = true;
                break;
            case true:
                nextValue = multiEditMode ? IndeterminateValue : false;
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
