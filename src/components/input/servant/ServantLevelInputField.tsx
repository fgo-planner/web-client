import { Immutable } from '@fgo-planner/common-core';
import { GameServant, InstantiatedServantConstants, InstantiatedServantUtils } from '@fgo-planner/data-core';
import { BaseTextFieldProps, InputBaseComponentProps, TextField } from '@mui/material';
import React, { ChangeEvent, FocusEvent, useCallback } from 'react';
import { FormUtils } from '../../../utils/form.utils';

type Props = {
    allowEmpty?: boolean;
    ascension: string;
    disabled?: boolean;
    /**
     * The game servant data that corresponds to the servant being edited. This
     * should be set to `undefined` if and only if multiple servants are being
     * edited, in which case, in which case the the field will be disabled.
     */
    gameServant?: Immutable<GameServant>;
    helperText?: string;
    label?: string;
    level: string;
    multiEditMode?: boolean;
    variant?: BaseTextFieldProps['variant'];
    onChange: (level: string, ascension: string, pushChanges?: boolean) => void;
};

const FieldName = 'level';

const DefaultLabel = 'Servant Level';

const IndeterminateDisplayText = '?';

const InputProps = {
    step: 1,
    min: InstantiatedServantConstants.MinLevel,
    max: InstantiatedServantConstants.MaxLevel
} as InputBaseComponentProps;

const transformLevelValue = (value: string): number => {
    const level = FormUtils.convertToInteger(value, InstantiatedServantConstants.MinLevel, InstantiatedServantConstants.MaxLevel);
    return level || InstantiatedServantConstants.MinLevel;
};

/**
 * Input field for a servant's level. This is applicable to both master and
 * planned servants.
 */
export const ServantLevelInputField = React.memo((props: Props) => {

    const {
        allowEmpty,
        ascension,
        disabled,
        gameServant,
        helperText,
        label,
        level,
        multiEditMode,
        variant,
        onChange
    } = props;

    const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const { value } = event.target;
        if (!value && allowEmpty) {
            return onChange(value, ascension);
        }
        const updatedLevel = transformLevelValue(value);
        onChange(String(updatedLevel), ascension);
    }, [allowEmpty, ascension, onChange]);

    const handleBlur = useCallback((event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        if (!gameServant) {
            return;
        }
        const { value } = event.target;
        if (!value && allowEmpty) {
            return onChange(value, ascension, true);
        }
        const maxLevel = gameServant.maxLevel;
        const updatedLevel = transformLevelValue(value);
        const updatedAscension = InstantiatedServantUtils.roundToNearestValidAscensionLevel(updatedLevel, Number(ascension), maxLevel);
        onChange(String(updatedLevel), String(updatedAscension), true);
    }, [allowEmpty, ascension, gameServant, onChange]);

    if (!gameServant && !multiEditMode) {
        console.error('ServantLevelInputField: gameServant must be provided when editing single servant');
        return null;
    }

    if (multiEditMode) {
        return (
            <TextField
                variant={variant}
                fullWidth
                label={label || DefaultLabel}
                value={IndeterminateDisplayText}
                disabled
            />
        );
    }

    return (
        <TextField
            variant={variant}
            fullWidth
            label={label || DefaultLabel}
            name={FieldName}
            type='number'
            inputProps={InputProps}
            value={level}
            helperText={helperText}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled || multiEditMode}
        />
    );

});
