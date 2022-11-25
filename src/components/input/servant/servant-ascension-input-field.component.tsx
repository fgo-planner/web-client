import { Immutable } from '@fgo-planner/common-core';
import { GameServant, InstantiatedServantConstants, InstantiatedServantUtils } from '@fgo-planner/data-core';
import { BaseTextFieldProps, FormControl, InputLabel, Select, SelectChangeEvent, TextField } from '@mui/material';
import React, { useCallback } from 'react';

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
    label?: string;
    level: string;
    multiEditMode?: boolean;
    onChange: (level: string, ascension: string, pushChanges: boolean) => void;
    variant?: BaseTextFieldProps['variant'];
};

const FieldName = 'ascension';

const DefaultLabel = 'Ascension';

const IndeterminateDisplayText = '?';

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
        label,
        level,
        multiEditMode,
        onChange,
        variant
    } = props;

    const handleChange = useCallback((event: SelectChangeEvent<string>): void => {
        if (!gameServant) {
            return;
        }
        const { value } = event.target;
        const maxLevel = gameServant.maxLevel;
        const updatedLevel = InstantiatedServantUtils.roundToNearestValidLevel(Number(value), Number(level), maxLevel);
        onChange(String(updatedLevel), value, true);
    }, [gameServant, level, onChange]);

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
                value={ascension}
                onChange={handleChange}
                disabled={disabled}
            >
                {allowEmpty && <option value=''>{'\u2014'}</option>}
                {InstantiatedServantConstants.AscensionLevels.map(value => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </Select>
        </FormControl>
    );

});
