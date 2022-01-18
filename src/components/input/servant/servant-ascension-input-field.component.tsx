import { GameServant } from '@fgo-planner/types';
import { BaseTextFieldProps, FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import React, { useCallback } from 'react';
import { GameServantConstants } from '../../../constants';
import { Immutable } from '../../../types/internal';
import { MasterServantUtils } from '../../../utils/master/master-servant.utils';

type Props = {
    allowEmpty?: boolean;
    ascension: string;
    disabled?: boolean;
    formId?: string;
    gameServant: Immutable<GameServant>;
    label?: string;
    level: string;
    name: string;
    onChange: (name: string, level: string, ascension: string, pushChanges: boolean) => void;
    variant?: BaseTextFieldProps['variant'];
};

const DefaultLabel = 'Ascension';

/**
 * Input field for servant's ascension level.
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
        name,
        onChange,
        variant
    } = props;

    const handleChange = useCallback((event: SelectChangeEvent<string>): void => {
        const { value } = event.target;
        const updatedLevel = MasterServantUtils.roundToNearestValidLevel(Number(value), Number(level), gameServant);
        onChange(name, String(updatedLevel), value, true);
    }, [gameServant, level, name, onChange]);

    const fieldId = formId ? `${formId}-${name}` : name;

    return (
        <FormControl variant={variant} fullWidth>
            <InputLabel htmlFor={name} shrink>{label || DefaultLabel}</InputLabel>
            <Select
                native
                id={fieldId}
                name={name}
                label={label || DefaultLabel}
                value={ascension}
                onChange={handleChange}
                disabled={disabled}
            >
                {allowEmpty && <option value=''>{'\u2014'}</option>}
                {GameServantConstants.AscensionLevels.map(value => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </Select>
        </FormControl>
    );

});
