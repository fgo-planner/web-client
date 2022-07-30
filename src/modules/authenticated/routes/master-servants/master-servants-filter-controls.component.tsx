import { FilterList, PersonOff, PersonOffOutlined as PersonOffOutlinedIcon, Replay } from '@mui/icons-material';
import { IconButton, TextField, Theme, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';

type Props = {
    filtersEnabled: boolean;
    onToggleShowUnsummonedServants: () => void;
    showUnsummonedServants: boolean;
};

const StyleClassPrefix = 'MasterServantsFilterControls';

const StyleProps = (theme: SystemTheme) => {

    const {
        breakpoints,
        palette
    } = theme as Theme;

    return {
        display: 'flex',
        alignItems: 'center',
        minHeight: '4rem',
        height: '4rem',
        px: 3,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: palette.divider,
        '& .MuiTextField-root': {
            mx: 2,
            width: '16rem',  // 256px
            [breakpoints.down('sm')]: {
                width: '12rem'  // 192px
            }
        },
        [breakpoints.down('sm')]: {
            px: 1
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterServantsFilterControls = React.memo((props: Props) => {

    const {
        filtersEnabled,
        onToggleShowUnsummonedServants,
        showUnsummonedServants
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
            <Tooltip key='unsummoned' title='Toggle un-summoned servants' placement='top'>
                <div>
                    <IconButton
                        onClick={onToggleShowUnsummonedServants}
                        children={showUnsummonedServants ? <PersonOff /> : <PersonOffOutlinedIcon />}
                        size='large'
                        color={showUnsummonedServants ? 'primary' : undefined}
                    />
                </div>
            </Tooltip>
        </Box>
    );

});
