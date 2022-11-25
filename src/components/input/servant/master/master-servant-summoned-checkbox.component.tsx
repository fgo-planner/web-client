import { InstantiatedServantUpdateBoolean } from '@fgo-planner/data-core';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { MouseEvent, useCallback } from 'react';
import { FormUtils } from '../../../../utils/form.utils';

type Props = {
    disabled?: boolean;
    label?: string;
    multiEditMode?: boolean;
    onChange: (value: InstantiatedServantUpdateBoolean, pushChanges: boolean) => void;
    value: InstantiatedServantUpdateBoolean;
};

const FieldName = 'summoned';

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
        onChange,
        value
    } = props;

    const handleClick = useCallback((_event: MouseEvent<HTMLButtonElement>): void => {
        const nextValue = FormUtils.computeNextToggleValue(value, multiEditMode);
        onChange(nextValue, true);
    }, [multiEditMode, onChange, value]);

    const checkboxNode = (
        <Checkbox
            name={FieldName}
            indeterminate={value === InstantiatedServantUpdateBoolean.Indeterminate}
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
