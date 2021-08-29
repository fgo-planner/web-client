import { makeStyles, StyleRules, TextField, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { ChangeEvent, FocusEvent, KeyboardEvent, useCallback, useMemo, useState } from 'react';
import { useEffect } from 'react';

type Props = {
    url?: string;
    onChange?: (url: string) => void;
};

const style = (theme: Theme) => ({
    root: {
        margin: theme.spacing(3, 6, 0, 0)
    },
    imagePreviewContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 420,
        paddingTop: theme.spacing(4),
        marginBottom: -40,
        boxSizing: 'border-box'
    },
    imagePreview: {
        maxWidth: '100%',
        maxHeight: '100%'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'UserThemeBackgroundImage'
};

const useStyles = makeStyles(style, styleOptions);

export const UserThemeBackgroundImage = React.memo(({ url, onChange }: Props) => {

    const classes = useStyles();

    const [urlInputValue, setUrlInputValue] = useState('');

    useEffect(() => {
        setUrlInputValue(url || '');
    }, [url]);

    const handleUrlInputChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value;
        setUrlInputValue(value);
    }, []);

    const handleUrlInputBlur = useCallback((event: FocusEvent<HTMLInputElement>): void => {
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
            variant="outlined"
            fullWidth
            label="Background Image URL"
            type="string"
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
            <div className={classes.imagePreviewContainer}>
                <img className={classes.imagePreview} src={url} alt="Not found" />
                {/* TODO Add fallback when image is not found. */}
            </div>
        );
    }, [classes, url]);

    return (
        <div className={classes.root}>
            {urlInputField}
            {imagePreviewNode}
        </div>
    );

});
