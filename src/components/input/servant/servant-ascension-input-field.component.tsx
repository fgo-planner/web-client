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
    allowEmpty?: boolean;
    disabled?: boolean;
    onChange: (name: string, level: string, ascension: string, pushChanges: boolean) => void;
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
        allowEmpty,
        disabled,
        onChange
    } = props;

    const handleChange = useCallback((event: SelectChangeEvent<string>): void => {
        const { value } = event.target;
        const updatedLevel = MasterServantUtils.roundToNearestValidLevel(Number(value), Number(level), servant);
        onChange(name, String(updatedLevel), value, true);
    }, [level, name, onChange, servant]);

    return (
        <FormControl variant={variant} fullWidth>
            <InputLabel htmlFor={name} shrink>{label || DefaultLabel}</InputLabel>
            <Select
                native
                id={`${formId}-${name}`}
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
