import { RgbaColor } from '@fgo-planner/types';
import { InputBaseComponentProps, makeStyles, StyleRules, TextField, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { colord, RgbColor } from 'colord';
import React, { ChangeEvent, FocusEvent, MouseEvent, useCallback, useState } from 'react';
import { useEffect } from 'react';
import { ModalOnCloseReason, Nullable } from '../../../../types/internal';
import { MathUtils } from '../../../../utils/math.utils';
import { UserThemeColorPickerMenu } from './user-theme-color-picker-menu.component';
import { UserThemeColorSwatch } from './user-theme-color-swatch.component';

type Props = {
    label: string;
    color: RgbaColor;
    allowEditAlpha?: boolean;
};

const AlphaInputProps = {
    min: 0,
    max: 1,
    step: 0.01
} as InputBaseComponentProps;

const toHexDisplayValue = (color: RgbaColor): string => {
    return colord(color).toHex()
        .toUpperCase()
        .substr(0, 7); // Don't display alpha value
};

const toAlphaDisplayValue = (color: RgbaColor): string => {
    return String(color.a || 1);
};

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        margin: theme.spacing(2, 0, 6, 6)
    },
    colorSwatchContainer: {
        width: 64,
        height: 64,
        marginRight: theme.spacing(6)
    },
    label: {
        width: 120
    },
    colorInputFieldContainer: {
        width: 200,
        marginRight: theme.spacing(4)
    },
    alphaInputFieldContainer: {
        width: 120
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'UserThemeColor'
};

const useStyles = makeStyles(style, styleOptions);

export const UserThemeColor = React.memo((props: Props) => {

    const classes = useStyles();

    const { label, color, allowEditAlpha } = props;

    const [colorInputValue, setColorInputValue] = useState<string>('');
    const [alphaInputValue, setAlphaInputValue] = useState<string>('');
    /**
     * Copy of the `color` prop. Should always be set to a new object reference 
     * whenever values inside `color` are updated in order to allow the swatch
     * display the color updates in real time.
     */
    const [swatchDisplayColor, setSwatchDisplayColor] = useState<RgbaColor | RgbColor>(color);
    const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<Nullable<Element>>();

    /*
     * Triggered on init and when resetting theme to default settings.
     */
    useEffect(() => {
        setColorInputValue(toHexDisplayValue(color));
        setAlphaInputValue(toAlphaDisplayValue(color));
        setSwatchDisplayColor(color);
    }, [color]);

    const handleColorSwatchClick = useCallback((event: MouseEvent<HTMLDivElement>): void => {
        setColorPickerAnchorEl(event.currentTarget);
    }, []);

    const handleColorPickerChange = useCallback((newColor: RgbaColor | RgbColor): void => {
        if (!color) {
            return;
        }
        Object.assign(color, newColor);
        setColorInputValue(toHexDisplayValue(color));
        setAlphaInputValue(toAlphaDisplayValue(color));
        setSwatchDisplayColor(newColor as RgbaColor);
    }, [color]);

    const handleColorPickerClose = useCallback((event: {}, reason: ModalOnCloseReason): void => {
        setColorPickerAnchorEl(null);
    }, []);

    const handleColorInputFieldChange = useCallback((event: ChangeEvent<{ name?: string; value: any }>): void => {
        const { value } = event.target;
        setColorInputValue(value);

        const colordColor = colord(value);
        if (!colordColor.isValid()) {
            return;
        }
        const newColor = colordColor.toRgb();
        /*
         * Reset alpha to 1 if it is not supposed to be editable.
         */
        if (!allowEditAlpha) {
            newColor.a = 1; 
        } 
        /*
         * Alpha value should not be updated unless the input is in rgba format.
         */
        else if (value.trim().toLowerCase().indexOf('rgba') !== 0) {
            newColor.a = color.a;
        }
        Object.assign(color, newColor);
        setAlphaInputValue(String(color.a));
        setSwatchDisplayColor(newColor);
    }, [allowEditAlpha, color]);

    const handleColorInputFieldBlur = useCallback((event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        setColorInputValue(toHexDisplayValue(color));
    }, [color]);

    const handleAlphaInputFieldChange = useCallback((event: ChangeEvent<{ name?: string; value: any }>): void => {
        if (!allowEditAlpha) {
            return;
        }
        const { value } = event.target;
        setAlphaInputValue(value);

        color.a = MathUtils.clamp(Number(value), 0, 1);
        setSwatchDisplayColor({...color});
    }, [allowEditAlpha, color]);

    const handleAlphaInputFieldBlur = useCallback((event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        if (!allowEditAlpha) {
            return;
        }
        // Round alpha value to two decimal places.
        const rounded = ~~(color.a * 100) / 100;
        color.a = rounded;
        setAlphaInputValue(String(rounded));
    }, [allowEditAlpha, color]);

    const colorInputField = (
        <TextField
            variant="outlined"
            fullWidth
            label="Color (Hex or RGBA)"
            type="string"
            value={colorInputValue}
            onChange={handleColorInputFieldChange}
            onBlur={handleColorInputFieldBlur}
        />
    );

    const alphaInputField = (
        <TextField
            variant="outlined"
            fullWidth
            label="Alpha"
            type="number"
            inputProps={AlphaInputProps}
            value={alphaInputValue}
            onChange={handleAlphaInputFieldChange}
            onBlur={handleAlphaInputFieldBlur}
            disabled={!allowEditAlpha}
        />
    );

    return (
        <div className={classes.root}>
            <div className={classes.colorSwatchContainer}>
                <UserThemeColorSwatch
                    color={swatchDisplayColor}
                    onClick={handleColorSwatchClick}
                    allowEditAlpha
                />
            </div>
            <div className={classes.label}>
                {label}
            </div>
            <div className={classes.colorInputFieldContainer}>
                {colorInputField}
            </div>
            <div className={classes.alphaInputFieldContainer}>
                {alphaInputField}
            </div>
            {/* <RgbaColorPicker color={color} onChange={setColor2} /> */}
            <UserThemeColorPickerMenu
                color={color}
                allowEditAlpha={allowEditAlpha}
                anchorEl={colorPickerAnchorEl}
                onChange={handleColorPickerChange}
                onClose={handleColorPickerClose}
            />
        </div>
    );
});
