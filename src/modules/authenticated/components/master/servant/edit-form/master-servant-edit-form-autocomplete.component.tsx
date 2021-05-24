import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React, { ChangeEvent, ReactNode, useCallback } from 'react';
import { GameServant, Nullable } from '../../../../../../types';

type Props = {
    selectedServant: GameServant;
    servantList: ReadonlyArray<Readonly<GameServant>>;
    disabled?: boolean;
    onChange?: (event: ChangeEvent<{}>, value: GameServant) => void;
};

const getOptionLabel = (option: Readonly<GameServant>): string => {
    return option.name || option.metadata?.displayName || String(option._id);
};

const isOptionSelected = (option: Readonly < GameServant >, value: Readonly<GameServant>): boolean => {
    return option._id === value._id;
};

const renderSelectOption = (servant: Readonly<GameServant>): ReactNode => {
    return <div>{servant.name}</div>;
};

const renderInput = (params: any): ReactNode => {
    return <TextField {...params} label="Servant" variant="outlined" />;
};

export const MasterServantEditFormAutocomplete = React.memo((props: Props) => {

    const {
        selectedServant,
        servantList,
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
            options={servantList as Array<Readonly<GameServant>>}
            noOptionsText="No results"
            getOptionLabel={getOptionLabel}
            getOptionSelected={isOptionSelected}
            renderOption={renderSelectOption}
            renderInput={renderInput}
            onChange={handleChange}
            value={selectedServant}
        />
    );

});
