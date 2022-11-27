import { Immutable } from '@fgo-planner/common-core';
import { GameServant, InstantiatedServantConstants, InstantiatedServantUtils } from '@fgo-planner/data-core';
import { BaseTextFieldProps, FormControl, FormHelperText, InputLabel, Select, SelectChangeEvent, TextField } from '@mui/material';
import React, { useCallback } from 'react';
import { FormConstants } from '../../../constants';

type Props = {
    allowEmpty?: boolean;
    ascension: string;
    disabled?: boolean;
    /**
     * @deprecated
     */
    formId?: string;
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
    onChange: (level: string, ascension: string, pushChanges: boolean) => void;
};

const FieldName = 'ascension';

const DefaultLabel = 'Ascension';

const IndeterminateDisplayText = '?';

const BlankDisplayText = '\u2014';

/**
 * Input field for a servant's ascension level. This is applicable to both master
 * and planned servants.
 */
export const ServantAscensionInputField = React.memo((props: Props) => {

    const {
        allowEmpty,
        ascension,
        disabled,
        formId,
        gameServant,
        helperText,
        label,
        level,
        multiEditMode,
        variant,
        onChange
    } = props;

    const handleChange = useCallback((event: SelectChangeEvent<string>): void => {
        if (!gameServant) {
            return;
        }
        let value = event.target.value;
        /**
         * If the blank option was selected, convert it back to an empty string before
         * calling the `onChange` callback.
         */
        if (value === FormConstants.BlankOptionValue) {
            value = '';
        }
        if (!value && allowEmpty) {
            return onChange('', value, true);
        }
        const maxLevel = gameServant.maxLevel;
        const currentLevel = Number(level) || InstantiatedServantConstants.MinLevel;  // Level can be blank
        const updatedLevel = InstantiatedServantUtils.roundToNearestValidLevel(Number(value), currentLevel, maxLevel);
        onChange(String(updatedLevel), value, true);
    }, [allowEmpty, gameServant, level, onChange]);

    if (!gameServant && !multiEditMode) {
        console.error('ServantAscensionInputField: gameServant must be provided when editing single servant');
        return null;
    }

    const fieldId = formId ? `${formId}-${FieldName}` : FieldName;

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
        <FormControl variant={variant} fullWidth>
            <InputLabel htmlFor={FieldName} shrink>{label || DefaultLabel}</InputLabel>
            <Select
                native
                id={fieldId}
                name={FieldName}
                label={label || DefaultLabel}
                value={ascension || FormConstants.BlankOptionValue}
                onChange={handleChange}
                disabled={disabled}
            >
                {allowEmpty && 
                    <option key={FormConstants.BlankOptionValue} value={FormConstants.BlankOptionValue}>
                        {BlankDisplayText}
                    </option>
                }
                {InstantiatedServantConstants.AscensionLevels.map(value => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </Select>
            <FormHelperText>{helperText}</FormHelperText>
        </FormControl>
    );

});
