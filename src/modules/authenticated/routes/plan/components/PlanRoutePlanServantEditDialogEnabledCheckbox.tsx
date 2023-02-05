import { InstantiatedServantUpdateBoolean } from '@fgo-planner/data-core';
import { Checkbox, Tooltip } from '@mui/material';
import React, { MouseEvent, useCallback } from 'react';
import { PlanEnhancementCategory } from '../../../../../types';
import { FormUtils } from '../../../../../utils/FormUtils';

type Props = {
    enhancement: PlanEnhancementCategory;
    label: string;
    multiEditMode: boolean;
    value: InstantiatedServantUpdateBoolean;
    onChange: (enhancement: PlanEnhancementCategory, value: InstantiatedServantUpdateBoolean) => void;
};

const TooltipEnterDelay = 250;

export const PlanRoutePlanServantEditDialogEnabledCheckbox = React.memo((props: Props) => {

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
