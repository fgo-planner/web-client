import { GameServant, MasterServant } from '@fgo-planner/data-types';
import { Autocomplete, FilterOptionsState, TextField } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { ChangeEvent, CSSProperties, HTMLAttributes, ReactNode, useCallback, useMemo } from 'react';
import { GameServantClassIcon } from '../../../../../components/game/servant/game-servant-class-icon.component';
import { useGameServantMap } from '../../../../../hooks/data/use-game-servant-map.hook';
import { Immutable, ImmutableArray } from '../../../../../types/internal';
import { GameServantUtils } from '../../../../../utils/game/game-servant.utils';

type Props = {
    availableServants?: ImmutableArray<MasterServant>;
    disabled?: boolean;
    onChange?: (event: ChangeEvent<{}>, value: Immutable<MasterServant>) => void;
    /**
     * The `MasterServant` instance that corresponds to the currently selected
     * option.
     */
    selectedServant?: Immutable<MasterServant>;
    size?: 'small' | 'medium';
};

type ServantOption = Immutable<{
    label: string;
    gameServant: GameServant;
    masterServant: MasterServant;
}>;

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

const generateServantOption = (gameServant: Immutable<GameServant>, masterServant: Immutable<MasterServant>): ServantOption => {
    const label = gameServant.metadata?.displayName || gameServant.name || String(gameServant._id);
    return {
        label,
        gameServant,
        masterServant
    };
};

const filterOptions = (options: Array<ServantOption>, state: FilterOptionsState<ServantOption>): Array<ServantOption> => {
    const inputValue = state.inputValue.trim();
    if (!inputValue) {
        return options;
    }
    return GameServantUtils.filterServants(inputValue, options, o => o.gameServant);
};

const isOptionSelected = (option: ServantOption, value: ServantOption): boolean => {
    return option.masterServant.instanceId === value.masterServant.instanceId;
};

const renderOption = (props: HTMLAttributes<HTMLLIElement>, option: ServantOption): ReactNode => {
    const { label, gameServant, masterServant } = option;
    return (
        <li {...props} key={masterServant.instanceId}>
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
        availableServants,
        disabled,
        onChange,
        selectedServant,
        size
    } = props;

    const gameServantMap = useGameServantMap();

    const options = useMemo((): Array<ServantOption> => {
        if (!gameServantMap || !availableServants?.length) {
            return [];
        }
        return availableServants.map(masterServant => {
            const gameServant = gameServantMap[masterServant.gameId];
            return generateServantOption(gameServant, masterServant);
        });
    }, [availableServants, gameServantMap]);

    const selectedOption = useMemo((): ServantOption | undefined => {
        if (!gameServantMap || !selectedServant) {
            return undefined;
        }
        const gameServant = gameServantMap[selectedServant.gameId];
        return generateServantOption(gameServant, selectedServant);
    }, [gameServantMap, selectedServant]);

    const handleChange = useCallback((event: ChangeEvent<{}>, value: ServantOption | null): void => {
        if (value === null) {
            // Is this case even possible?
            return;
        }
        onChange?.(event, value.masterServant);
    }, [onChange]);

    /*
     * This can be undefined during the initial render.
     */
    if (!selectedOption) {
        return null;
    }

    if (disabled || !options.length) {
        return (
            <TextField
                variant='outlined'
                size={size}
                fullWidth
                label='Servant'
                value={selectedOption.gameServant.name}
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
