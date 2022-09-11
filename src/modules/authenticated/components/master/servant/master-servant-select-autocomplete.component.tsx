import { Immutable } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import { Autocomplete, FilterOptionsState, TextField } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { CSSProperties, HTMLAttributes, ReactNode, SyntheticEvent, useCallback, useMemo } from 'react';
import { GameServantClassIcon } from '../../../../../components/game/servant/game-servant-class-icon.component';
import { useGameServantList } from '../../../../../hooks/data/use-game-servant-list.hook';
import { GameServantUtils } from '../../../../../utils/game/game-servant.utils';

type Props = {
    disabled?: boolean;
    multiEditMode?: boolean;
    onChange?: (value: Immutable<GameServant>) => void;
    selectedServant?: Immutable<GameServant>;
    size?: 'small' | 'medium';
};

type ServantOption = Immutable<{
    label: string;
    servant: GameServant;
}>;

const MultiSelectionDisplayText = 'Multiple servants selected';

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

const generateServantOption = (servant: Immutable<GameServant>): ServantOption => {
    const label = servant.metadata?.displayName || servant.name || String(servant._id);
    return { label, servant };
};

const filterOptions = (options: Array<ServantOption>, state: FilterOptionsState<ServantOption>): Array<ServantOption> => {
    const inputValue = state.inputValue.trim();
    if (!inputValue) {
        return options;
    }
    return GameServantUtils.filterServants(inputValue, options, o => o.servant);
};

const isOptionSelected = (option: ServantOption, value: ServantOption): boolean => {
    return option.servant._id === value.servant._id;
};

const renderOption = (props: HTMLAttributes<HTMLLIElement>, option: ServantOption): ReactNode => {
    const { servant, label } = option;
    return (
        <li {...props} key={servant._id}>
            <div style={optionStyles.root}>
                <div style={optionStyles.rarity}>
                    {`${servant.rarity} \u2605`}
                </div>
                <GameServantClassIcon
                    servantClass={servant.class}
                    rarity={servant.rarity}
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

export const MasterServantSelectAutocomplete = React.memo((props: Props) => {

    const gameServantList = useGameServantList();

    const {
        disabled,
        multiEditMode,
        onChange,
        selectedServant,
        size
    } = props;

    const options = useMemo((): Array<ServantOption> => {
        if (!gameServantList?.length) {
            return [];
        }
        return gameServantList.map(generateServantOption);
    }, [gameServantList]);

    const selectedOption = useMemo((): ServantOption | undefined => {
        if (!selectedServant || !options.length) {
            return undefined;
        }
        return generateServantOption(selectedServant);
    }, [options, selectedServant]);

    const handleChange = useCallback((_: SyntheticEvent, value: ServantOption | null): void => {
        if (value === null) {
            // Is this case even possible?
            return;
        }
        onChange?.(value.servant);
    }, [onChange]);

    if (multiEditMode || disabled || !selectedOption) {
        return (
            <TextField
                variant='outlined'
                size={size}
                fullWidth
                label='Servant'
                value={multiEditMode ? MultiSelectionDisplayText : selectedOption?.servant.name}
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
