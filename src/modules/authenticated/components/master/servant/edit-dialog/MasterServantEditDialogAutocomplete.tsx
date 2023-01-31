import { Immutable } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import { Autocomplete, FilterOptionsState, TextField } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { CSSProperties, HTMLAttributes, ReactNode, SyntheticEvent, useCallback, useEffect, useMemo } from 'react';
import { ServantClassIcon } from '../../../../../../components/servant/ServantClassIcon';
import { useGameServantList } from '../../../../../../hooks/data/use-game-servant-list.hook';
import { useGameServantKeywordsMap } from '../../../../../../hooks/data/useGameServantKeywordsMap';
import { GameServantUtils } from '../../../../../../utils/game/game-servant.utils';

type Props = {
    disabled?: boolean;
    multiEditMode: boolean;
    onChange: (value: Immutable<GameServant>) => void;
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

const generateOption = (servant: Immutable<GameServant>): ServantOption => {
    const label = servant.displayName || servant.name || String(servant._id);
    return { label, servant };
};

const getGameServant = (option: ServantOption): Immutable<GameServant> => {
    return option.servant;
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
                <ServantClassIcon
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

export const MasterServantEditDialogAutocomplete = React.memo((props: Props) => {

    const gameServantList = useGameServantList();
    const gameServantsKeywordsMap = useGameServantKeywordsMap();

    const {
        disabled,
        multiEditMode,
        onChange,
        selectedServant,
        size
    } = props;

    /**
     * If there is currently no servant selected, and there are available servants,
     * then select the first servant from the list.
     */
    useEffect((): void => {
        if (selectedServant || !gameServantList?.length) {
            return;
        }
        onChange(gameServantList[0]);
    }, [gameServantList, onChange, selectedServant]);

    const options = useMemo((): Array<ServantOption> => {
        if (!gameServantList?.length) {
            return [];
        }
        return gameServantList.map(generateOption);
    }, [gameServantList]);

    const selectedOption = useMemo((): ServantOption | undefined => {
        if (!selectedServant || !options.length) {
            return undefined;
        }
        return generateOption(selectedServant);
    }, [options, selectedServant]);

    
    const filterOptions = useCallback((options: Array<ServantOption>, state: FilterOptionsState<ServantOption>): Array<ServantOption> => {
        const inputValue = state.inputValue.trim();
        if (!inputValue) {
            return options;
        }
        return GameServantUtils.filterServants(
            gameServantsKeywordsMap || {},
            inputValue,
            options,
            getGameServant
        );
    }, [gameServantsKeywordsMap]);

    const handleChange = useCallback((_: SyntheticEvent, value: ServantOption | null): void => {
        if (value === null) {
            // Is this case even possible?
            return;
        }
        onChange(value.servant);
    }, [onChange]);

    /**
     * This can be undefined during the initial render. We need to return `null`
     * first or else the input box will not be populated when a servant is
     * auto-selected.
     */
    if (!selectedServant) {
        return null;
    }

    if (multiEditMode || disabled) {
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
