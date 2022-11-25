import { InstantiatedServantUpdateBoolean, PlanServantUpdate } from '@fgo-planner/data-core';
import { Checkbox, Tooltip } from '@mui/material';
import React, { MouseEvent, useCallback } from 'react';
import { FormUtils } from '../../../../../utils/form.utils';

export type EnhancementCategory = keyof PlanServantUpdate['enabled'];

type Props = {
    enhancement: EnhancementCategory;
    label: string;
    multiEditMode: boolean;
    value: InstantiatedServantUpdateBoolean;
    onChange: (enhancement: EnhancementCategory, value: InstantiatedServantUpdateBoolean) => void;
};

const TooltipEnterDelay = 250;

export const PlanServantEditDialogEnabledCheckbox = React.memo((props: Props) => {

    const {
        enhancement,
        label,
        multiEditMode,
        value,
        onChange
    } = props;

    const handleClick = useCallback((_event: MouseEvent<HTMLButtonElement>): void => {
        const nextValue = FormUtils.computeNextToggleValue(value, multiEditMode);
        onChange(enhancement, nextValue);
    }, [enhancement, multiEditMode, onChange, value]);

    return (
        <Tooltip
            title={`${label} ${value ? 'enabled' : 'disabled'}`}
            enterDelay={TooltipEnterDelay}
        >
            <Checkbox
                name={enhancement}
                indeterminate={value === InstantiatedServantUpdateBoolean.Indeterminate}
                checked={!!value}
                onClick={handleClick}
            />
        </Tooltip>
    );

});
