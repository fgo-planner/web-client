import { Icon, IconButton, TextField, Theme, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ChangeEvent, useCallback, useEffect } from 'react';
import { useDebounce } from '../../../../../hooks/user-interface/useDebounce';

export type MasterServantsFilter = {
    searchText: string;
};

type Props = {
    filtersEnabled: boolean;
    onFilterChange: (filter: MasterServantsFilter) => void
};

const SearchDebounceDelay = 250;

const StyleClassPrefix = 'MasterServantsRouteFilterControls';

const StyleProps = (theme: SystemTheme) => {

    const {
        breakpoints,
        palette,
        spacing
    } = theme as Theme;

    return {
        display: 'flex',
        alignItems: 'center',
        minHeight: '4rem',
        height: '4rem',
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: palette.divider,
        '& .MuiTextField-root': {
            width: spacing(64),  // 256px
            ml: 14,
            '& .MuiOutlinedInput-root': {
                backgroundColor: palette.background.paper
            },
            [breakpoints.down('sm')]: {
                width: spacing(48),  // 192px
                ml: 4
            }
        },
        '& >div:not(:first-of-type)': {
            pl: 0.75
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterServantsRouteFilterControls = React.memo((props: Props) => {

    const {
        filtersEnabled,
        onFilterChange
    } = props;

    const [
        searchText,
        debouncedSearchText,
        setSearchText
    ] = useDebounce<string>(SearchDebounceDelay, '');

    useEffect(() => {
        if (!filtersEnabled) {
            setSearchText('');
        }
    }, [filtersEnabled, setSearchText]);

    useEffect(() => {
        onFilterChange({
            searchText: debouncedSearchText
        });
    }, [debouncedSearchText, onFilterChange]);

    const handleSearchTextChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        if (!filtersEnabled) {
            return;
        }
        setSearchText(event.target.value);
    }, [filtersEnabled, setSearchText]);

    if (!filtersEnabled) {
        return null;
    }

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <TextField
                variant='outlined'
                label='Search'
                size='small'
                value={searchText}
                onChange={handleSearchTextChange}
            />
            <Tooltip key='advanced-filters' title='Advanced filters' placement='top'>
                <div>
                    <IconButton
                        // onClick={}
                        children={<Icon>filter_list</Icon>}
                        size='large'
                    />
                </div>
            </Tooltip>
            <Tooltip key='reset' title='Reset filters' placement='top'>
                <div>
                    <IconButton
                        // onClick={}
                        children={<Icon>replay</Icon>}
                        size='large'
                    />
                </div>
            </Tooltip>
            {/* <Tooltip key='unsummoned' title='Toggle un-summoned servants' placement='top'>
                <div>
                    <IconButton
                        onClick={onToggleShowUnsummonedServants}
                        children={showUnsummonedServants ? <PersonOff /> : <PersonOffOutlinedIcon />}
                        size='large'
                        color={showUnsummonedServants ? 'primary' : undefined}
                    />
                </div>
            </Tooltip> */}
        </Box>
    );

});
