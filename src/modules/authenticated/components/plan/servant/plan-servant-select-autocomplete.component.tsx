import { GameServant, PlanServantType } from '@fgo-planner/types';
import { Autocomplete, FilterOptionsState, TextField } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { ChangeEvent, CSSProperties, HTMLAttributes, ReactNode, useCallback, useMemo } from 'react';
import { GameServantClassIcon } from '../../../../../components/game/servant/game-servant-class-icon.component';
import { useGameServantMap } from '../../../../../hooks/data/use-game-servant-map.hook';
import { ImmutableArray } from '../../../../../types/internal';
import { GameServantUtils } from '../../../../../utils/game/game-servant.utils';

type ChangeValue = {
    gameId: number;
    instanceId?: number;
};

type AvailableServant = {
    gameId: number;
    instanceId?: number;
};

type Props = {
    availableServants?: ImmutableArray<AvailableServant>;
    disabled?: boolean;
    onChange?: (event: ChangeEvent<{}>, value: ChangeValue) => void;
    /**
     * The `gameId` of the selected planned servant.
     */
    selectedGameId: number;
    /**
     * The `instanceId` of the selected planned servant. Must be provided for owned
     * servants, and `undefined` for unowned servants.
     */
    selectedInstanceId?: number;
    size?: 'small' | 'medium';
    type: PlanServantType;
};

type ServantOption = Readonly<{
    key: number;
    instanceId?: number;
    label: string;
    servant: Readonly<GameServant>;
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

const generateServantOption = (servant: Readonly<GameServant>, instanceId?: number): ServantOption => {
    const key = instanceId ?? servant._id;
    const label = servant.metadata?.displayName || servant.name || String(servant._id);
    return {
        key,
        label,
        instanceId,
        servant
    };
};

const filterOptions = (options: Array<ServantOption>, state: FilterOptionsState<ServantOption>): Array<ServantOption> => {
    const inputValue = state.inputValue.trim();
    if (!inputValue) {
        return options;
    }
    return GameServantUtils.filterServants(inputValue, options, o => o.servant);
};

const isOptionSelected = (option: Readonly<ServantOption>, value: Readonly<ServantOption>): boolean => {
    return option.key === value.key;
};

const renderOption = (props: HTMLAttributes<HTMLLIElement>, option: Readonly<ServantOption>): ReactNode => {
    const { key, label, servant } = option;
    return (
        <li {...props} key={key}>
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

export const PlanServantSelectAutocomplete = React.memo((props: Props) => {
    
    const {
        availableServants,
        disabled,
        onChange,
        selectedGameId,
        selectedInstanceId,
        size
    } = props;

    const gameServantMap = useGameServantMap();

    const options = useMemo((): ReadonlyArray<ServantOption> => {
        if (!gameServantMap || !availableServants?.length) {
            return [];
        }
        return availableServants.map(({ gameId, instanceId }) => {
            const servant = gameServantMap[gameId];
            return generateServantOption(servant, instanceId);
        });
    }, [availableServants, gameServantMap]);

    const selectedOption = useMemo((): ServantOption | undefined => {
        if (!gameServantMap) {
            return undefined;
        }
        const gameServant = gameServantMap[selectedGameId];
        return generateServantOption(gameServant, selectedInstanceId);
    }, [gameServantMap, selectedGameId, selectedInstanceId]);

    const handleChange = useCallback((event: ChangeEvent<{}>, value: ServantOption | null): void => {
        if (value === null) {
            // Is this case even possible?
            return;
        }
        const gameId = value.servant._id;
        const instanceId = value.instanceId;
        onChange && onChange(event, { gameId, instanceId });
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
                value={selectedOption.servant.name}
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
