import { GameServant } from '@fgo-planner/data-types';
import { BaseTextFieldProps, InputBaseComponentProps, TextField } from '@mui/material';
import React, { ChangeEvent, FocusEvent, useCallback } from 'react';
import { GameServantConstants } from '../../../constants';
import { Immutable } from '../../../types/internal';
import { FormUtils } from '../../../utils/form.utils';
import { MasterServantUtils } from '../../../utils/master/master-servant.utils';

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
    label?: string;
    level: string;
    multiEditMode?: boolean;
    name: string;
    onChange: (name: string, level: string, ascension: string, pushChanges?: boolean) => void;
    variant?: BaseTextFieldProps['variant'];
};

const DefaultLabel = 'Servant Level';

const IndeterminateDisplayText = '?';

const InputProps = {
    step: 1,
    min: GameServantConstants.MinLevel,
    max: GameServantConstants.MaxLevel
} as InputBaseComponentProps;

const transformLevelValue = (value: string): number => {
    const level = FormUtils.convertToInteger(value, GameServantConstants.MinLevel, GameServantConstants.MaxLevel);
    return level || GameServantConstants.MinLevel;
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
        label,
        level,
        multiEditMode,
        name,
        onChange,
        variant
    } = props;

    const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const { value } = event.target;
        if (!value && allowEmpty) {
            return onChange(name, value, ascension);
        }
        const updatedLevel = transformLevelValue(value);
        onChange(name, String(updatedLevel), ascension);
    }, [allowEmpty, ascension, name, onChange]);

    const handleBlur = useCallback((event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        if (!gameServant) {
            return;
        }
        const { value } = event.target;
        if (!value && allowEmpty) {
            return onChange(name, value, ascension, true);
        }
        const updatedLevel = transformLevelValue(value);
        const updatedAscension = MasterServantUtils.roundToNearestValidAscensionLevel(updatedLevel, Number(ascension), gameServant);
        onChange(name, String(updatedLevel), String(updatedAscension), true);
    }, [allowEmpty, ascension, gameServant, name, onChange]);

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
            name={name}
            type='number'
            inputProps={InputProps}
            value={level}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled || multiEditMode}
        />
    );

});
