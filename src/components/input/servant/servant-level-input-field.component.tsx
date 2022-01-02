import { GameServant } from '@fgo-planner/types';
import { BaseTextFieldProps, InputBaseComponentProps, TextField } from '@mui/material';
import React, { ChangeEvent, FocusEvent, useCallback } from 'react';
import { GameServantConstants } from '../../../constants';
import { FormUtils } from '../../../utils/form.utils';
import { MasterServantUtils } from '../../../utils/master/master-servant.utils';

type Props = {
    level: string;
    ascension: string;
    servant: Readonly<GameServant>;
    variant?: BaseTextFieldProps['variant'];
    label?: string;
    name: string;
    disabled?: boolean;
    onChange: (level: string, ascension: string, pushChanges?: boolean) => void;
};

const DefaultLabel = 'Servant Level';

const InputProps = {
    step: 1,
    min: GameServantConstants.MinLevel,
    max: GameServantConstants.MaxLevel
} as InputBaseComponentProps;

const transformLevelValue = (value: string): number => {
    return FormUtils.transformInputToInteger(value, GameServantConstants.MinLevel, GameServantConstants.MaxLevel) || 1;
};

/**
 * Input field for servant's level.
 */
export const ServantLevelInputField = React.memo((props: Props) => {

    const {
        level,
        ascension,
        servant,
        variant,
        label,
        name,
        disabled,
        onChange
    } = props;

    const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const { value } = event.target;
        const updatedLevel = transformLevelValue(value);
        onChange(String(updatedLevel), ascension);
    }, [ascension, onChange]);

    const handleBlur = useCallback((event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const { value } = event.target;
        const updatedLevel = transformLevelValue(value);
        const updatedAscension = MasterServantUtils.roundToNearestValidAscensionLevel(updatedLevel, Number(ascension), servant);
        onChange(String(updatedLevel), String(updatedAscension), true);
    }, [ascension, onChange, servant]);

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
