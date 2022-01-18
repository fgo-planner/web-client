import { GameServant } from '@fgo-planner/types';
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
    gameServant: Immutable<GameServant>;
    label?: string;
    level: string;
    name: string;
    onChange: (name: string, level: string, ascension: string, pushChanges?: boolean) => void;
    variant?: BaseTextFieldProps['variant'];
};

const DefaultLabel = 'Servant Level';

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
 * Input field for servant's level.
 */
export const ServantLevelInputField = React.memo((props: Props) => {

    const {
        allowEmpty,
        ascension,
        disabled,
        gameServant,
        label,
        level,
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
        const { value } = event.target;
        if (!value && allowEmpty) {
            return onChange(name, value, ascension, true);
        }
        const updatedLevel = transformLevelValue(value);
        const updatedAscension = MasterServantUtils.roundToNearestValidAscensionLevel(updatedLevel, Number(ascension), gameServant);
        onChange(name, String(updatedLevel), String(updatedAscension), true);
    }, [allowEmpty, ascension, gameServant, name, onChange]);

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
            disabled={disabled}
        />
    );

});
