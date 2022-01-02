import { GameServant } from '@fgo-planner/types';
import { BaseTextFieldProps, FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import React, { useCallback } from 'react';
import { GameServantConstants } from '../../../constants';
import { MasterServantUtils } from '../../../utils/master/master-servant.utils';

type Props = {
    level: string;
    ascension: string;
    servant: Readonly<GameServant>;
    variant?: BaseTextFieldProps['variant'];
    formId: string;
    label?: string;
    name: string;
    disabled?: boolean;
    onChange: (level: string, ascension: string, pushChanges: boolean) => void;
};

const DefaultLabel = 'Ascension';

/**
 * Input field for servant's ascension level.
 */
export const ServantAscensionInputField = React.memo((props: Props) => {

    const {
        level,
        ascension,
        servant,
        variant,
        formId,
        label,
        name,
        disabled,
        onChange
    } = props;

    const handleChange = useCallback((event: SelectChangeEvent<string>): void => {
        const { value } = event.target;
        const updatedLevel = MasterServantUtils.roundToNearestValidLevel(Number(value), Number(level), servant);
        onChange(String(updatedLevel), value, true);
    }, [level, onChange, servant]);

    return (
        <FormControl variant={variant} fullWidth>
            <InputLabel htmlFor={name}>{label || DefaultLabel}</InputLabel>
            <Select
                native
                id={`${formId}-${name}`}
                name={name}
                label={label || DefaultLabel}
                value={ascension}
                onChange={handleChange}
                disabled={disabled}
            >
                {GameServantConstants.AscensionLevels.map(value => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </Select>
        </FormControl>
    );

});
