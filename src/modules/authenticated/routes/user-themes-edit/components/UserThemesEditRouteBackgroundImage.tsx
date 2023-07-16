import { TextField } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { ChangeEvent, FocusEvent, KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';

type Props = {
    url?: string;
    onChange?: (url: string) => void;
};

const StyleClassPrefix = 'UserThemesEditRouteBackgroundImage';

const StyleProps = {
    mt: 3,
    mr: 6,
    [`& .${StyleClassPrefix}-imagePreviewContainer`]: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 420,
        pt: 4,
        marginBottom: -40,
        boxSizing: 'border-box'
    },
    [`& .${StyleClassPrefix}-imagePreview`]: {
        maxWidth: '100%',
        maxHeight: '100%'
    }
} as SystemStyleObject<Theme>;

export const UserThemesEditRouteBackgroundImage = React.memo(({ url, onChange }: Props) => {

    const [urlInputValue, setUrlInputValue] = useState('');

    useEffect(() => {
        setUrlInputValue(url || '');
    }, [url]);

    const handleUrlInputChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value;
        setUrlInputValue(value);
    }, []);

    const handleUrlInputBlur = useCallback((_event: FocusEvent<HTMLInputElement>): void => {
        onChange && onChange(urlInputValue);
    }, [onChange, urlInputValue]);

    const handleUrlInputKeyPress = useCallback((event: KeyboardEvent<HTMLInputElement>): void => {
        if (event.key !== 'Enter' || url === urlInputValue) {
            return;
        }
        onChange && onChange(urlInputValue);
    }, [onChange, url, urlInputValue]);

    const urlInputField = (
        <TextField
            variant='outlined'
            fullWidth
            label='Background Image URL'
            type='string'
            value={urlInputValue}
            onChange={handleUrlInputChange}
            onBlur={handleUrlInputBlur}
            onKeyPress={handleUrlInputKeyPress}
        />
    );

    const imagePreviewNode = useMemo(() => {
        if (!url || !url.trim()) {
            return null;
        }
        return (
            <div className={`${StyleClassPrefix}-imagePreviewContainer`}>
                <img className={`${StyleClassPrefix}-imagePreview`} src={url} alt='Not found' />
                {/* TODO Add fallback when image is not found. */}
            </div>
        );
    }, [url]);

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {urlInputField}
            {imagePreviewNode}
        </Box>
    );

});
