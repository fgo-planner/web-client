import { FilterList, Replay } from '@mui/icons-material';
import { IconButton, TextField, Theme, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';

type Props = {
    filtersEnabled: boolean;
};

const StyleClassPrefix = 'MasterServantsFilterControls';

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
        pl: 14,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: palette.divider,
        '& .MuiTextField-root': {
            width: spacing(64),  // 256px
            '& .MuiOutlinedInput-root': {
                backgroundColor: palette.background.paper
            },
            [breakpoints.down('sm')]: {
                width: spacing(48)  // 192px
            }
        },
        '& >div:not(:first-of-type)': {
            pl: 0.75
        },
        [breakpoints.down('sm')]: {
            pl: 4
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterServantsFilterControls = React.memo((props: Props) => {

    const {
        filtersEnabled
    } = props;

    const [searchText, setSearchText] = useState<string>('');

    useEffect(() => {
        if (!filtersEnabled) {
            setSearchText('');
        }
    }, [filtersEnabled]);

    const handleSearchTextChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        if (!filtersEnabled) {
            return;
        }
        setSearchText(event.target.value);
    }, [filtersEnabled]);

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
                        children={<FilterList />}
                        size='large'
                    />
                </div>
            </Tooltip>
            <Tooltip key='reset' title='Reset filters' placement='top'>
                <div>
                    <IconButton
                        // onClick={}
                        children={<Replay />}
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
