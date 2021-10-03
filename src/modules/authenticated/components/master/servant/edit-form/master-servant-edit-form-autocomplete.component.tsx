import { GameServant } from '@fgo-planner/types';
import { TextField } from '@mui/material';
import { Autocomplete } from '@mui/material';
import React, { ChangeEvent, HTMLAttributes, ReactNode, useCallback } from 'react';
import { Nullable } from '../../../../../../types/internal';

type Props = {
    selectedServant: GameServant;
    servantList: ReadonlyArray<Readonly<GameServant>>;
    size?: 'small' | 'medium';
    disabled?: boolean;
    onChange?: (event: ChangeEvent<{}>, value: GameServant) => void;
};

const getOptionLabel = (option: Readonly<GameServant>): string => {
    return option.name || option.metadata?.displayName || String(option._id);
};

const isOptionSelected = (option: Readonly<GameServant>, value: Readonly<GameServant>): boolean => {
    return option._id === value._id;
};

const renderSelectOption = (props: HTMLAttributes<HTMLLIElement>, servant: Readonly<GameServant>): ReactNode => {
    return (
        <li {...props}>
            <div>{servant.name}</div>
        </li>
    );
};

const renderInput = (params: any): ReactNode => {
    return <TextField {...params} label="Servant" variant="outlined" />;
};

export const MasterServantEditFormAutocomplete = React.memo((props: Props) => {

    const {
        selectedServant,
        servantList,
        size,
        disabled,
        onChange
    } = props;

    const handleChange = useCallback((event: ChangeEvent<{}>, servant: Nullable<Readonly<GameServant>>): void => {
        if (servant == null) {
            // Is this case even possible?
            return;
        }
        onChange && onChange(event, servant);
    }, [onChange]);

    if (disabled) {
        return (
            <TextField
                variant="outlined"
                size={size}
                fullWidth
                label="Servant"
                value={selectedServant.name}
                disabled
            />
        );
    }

    return (
        <Autocomplete
            autoHighlight
            autoSelect
            fullWidth
            size={size}
            options={servantList as Array<Readonly<GameServant>>}
            noOptionsText="No results"
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={isOptionSelected}
            renderOption={renderSelectOption}
            renderInput={renderInput}
            onChange={handleChange}
            value={selectedServant}
        />
    );

});
