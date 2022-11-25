import { CollectionUtils, Immutable } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import { Autocomplete, FilterOptionsState, TextField } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { CSSProperties, HTMLAttributes, ReactNode, SyntheticEvent, useCallback, useEffect, useMemo } from 'react';
import { GameServantClassIcon } from '../../../../../components/game/servant/game-servant-class-icon.component';
import { AutocompleteOptionWithLabel, MasterServantAggregatedData } from '../../../../../types';
import { GameServantUtils } from '../../../../../utils/game/game-servant.utils';

type Props = {
    availableServants?: ReadonlyArray<MasterServantAggregatedData>;
    disabled?: boolean;
    onChange: (value: MasterServantAggregatedData) => void;
    /**
     * The currently selected option.
     */
    selectedServant?: MasterServantAggregatedData;
    size?: 'small' | 'medium';
};

type Option = AutocompleteOptionWithLabel<MasterServantAggregatedData>;

const optionStyles = {
    root: {
        display: 'flex',
        /**
         * This fixes text truncation issues inside flex box.
         * @see https://css-tricks.com/flexbox-truncated-text/
         */
        minWidth: 0
    } as CSSProperties,
    rarity: {
        minWidth: 28
    } as CSSProperties,
    classIcon: {
        px: 1
    } as SystemStyleObject<Theme>
};

const generateOption = (data: MasterServantAggregatedData): Option => ({
    label: GameServantUtils.getDisplayedName(data.gameServant),
    data
});

const getGameServant = (option: Option): Immutable<GameServant> => {
    return option.data.gameServant;
};

const filterOptions = (options: Array<Option>, state: FilterOptionsState<Option>): Array<Option> => {
    const inputValue = state.inputValue.trim();
    if (!inputValue) {
        return options;
    }
    return GameServantUtils.filterServants(inputValue, options, getGameServant);
};

const isOptionSelected = (option: Option, value: Option): boolean => {
    return option.data.instanceId === value.data.instanceId;
};

const renderOption = (props: HTMLAttributes<HTMLLIElement>, option: Option): ReactNode => {
    const {
        label,
        data: {
            instanceId,
            gameServant
        }
    } = option;

    return (
        <li {...props} key={instanceId}>
            <div style={optionStyles.root}>
                <div style={optionStyles.rarity}>
                    {`${gameServant.rarity} \u2605`}
                </div>
                <GameServantClassIcon
                    servantClass={gameServant.class}
                    rarity={gameServant.rarity}
                    sx={optionStyles.classIcon}
                />
                <div className='truncate'>
                    {label}
                </div>
            </div>
        </li>
    );
};

const renderInput = (params: any): ReactNode => {
    return <TextField {...params} label='Servant' variant='outlined' />;
};

export const PlanServantSelectAutocomplete = React.memo((props: Props) => {

    const {
        availableServants = CollectionUtils.emptyArray(),
        disabled,
        onChange,
        selectedServant,
        size
    } = props;

    /**
     * If there is currently no servant selected, and there are available servants,
     * then select the first servant from the list.
     */
    useEffect((): void => {
        if (selectedServant || !availableServants.length) {
            return;
        }
        onChange(availableServants[0]);
    }, [availableServants, onChange, selectedServant]);

    const options = useMemo((): Array<Option> => {
        if (!availableServants.length) {
            return [];
        }
        return availableServants.map(generateOption);
    }, [availableServants]);

    const selectedOption = useMemo((): Option | undefined => {
        if (!selectedServant || !options.length) {
            return undefined;
        }
        return generateOption(selectedServant);
    }, [options, selectedServant]);

    const handleChange = useCallback((_event: SyntheticEvent, value: Option | null): void => {
        if (value === null) {
            // Is this case even possible?
            return;
        }
        onChange(value.data);
    }, [onChange]);

    /*
     * This can be undefined during the initial render.
     */
    if (!selectedServant) {
        return null;
    }

    if (disabled || !availableServants.length) {
        return (
            <TextField
                variant='outlined'
                size={size}
                fullWidth
                label='Servant'
                value={selectedServant.gameServant.name}
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
            options={options}
            noOptionsText='No results'
            isOptionEqualToValue={isOptionSelected}
            filterOptions={filterOptions}
            renderOption={renderOption}
            renderInput={renderInput}
            onChange={handleChange}
            value={selectedOption}
        />
    );

});
