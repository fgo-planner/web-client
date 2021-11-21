
import { FileCopy as FileCopyIcon, SvgIconComponent } from '@mui/icons-material';
import { alpha, TextField } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { ChangeEvent, PropsWithChildren, PureComponent, ReactNode } from 'react';
import Dropzone, { DropzoneRef, DropzoneState } from 'react-dropzone';
import { ThemeConstants } from '../../styles/theme-constants';
import { ComponentStyleProps } from '../../types/internal';

type Props = PropsWithChildren<{
    dropzoneRef?: React.RefObject<DropzoneRef>;
    className?: string;
    variant?: 'standard' | 'outlined' | 'filled';
    rows?: number;
    rowsMax?: number;
    label?: string;
    hideDragOverlayIcon?: boolean;
    dragOverlayIcon?: SvgIconComponent;
    dragOverlayText?: string;
    value?: string;
    onValueChange?: (value: string) => void;
}> & Pick<ComponentStyleProps, 'className' | 'sx'>;

const DefaultTextareaVariant = 'outlined';

const DefaultTextareaRows = 10;

const DefaultDragOverlayIcon = FileCopyIcon;

const DefaultDragOverlayText = 'Drop your file here';

export const StyleClassPrefix = 'FileInputWithTextarea';

const StyleProps = (theme: Theme) => ({
    position: 'relative',
    width: '100%',
    p: 4,
    boxSizing: 'border-box',
    [`& .${StyleClassPrefix}-drag-overlay`]: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        borderWidth: '3px',
        borderColor: theme.palette.primary.light,
        borderStyle: 'dashed',
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.primary.light, 0.2),
        opacity: 0.69
    },
    [`& .${StyleClassPrefix}-drag-overlay-icon`]: {
        fontSize: '4rem',
        pb: 4
    },
    [`& .${StyleClassPrefix}-drag-overlay-text`]: {
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontSize: '2rem',
        // color: theme.palette.text.secondary
    }
} as SystemStyleObject<Theme>);

/**
 * For inputting plain-text data, via file or input field. Includes a drop area
 * for file drag-and-drop.
 */
// TODO Convert this to functional component
export const FileInputWithTextarea = class extends PureComponent<Props> {

    constructor(props: Props) {
        super(props);

        this._renderDropzoneContents = this._renderDropzoneContents.bind(this);
        this._handleFileSelected = this._handleFileSelected.bind(this);
        this._handleTextAreaChange = this._handleTextAreaChange.bind(this);
    }

    render(): ReactNode {
        const { dropzoneRef } = this.props;
        return (
            <Dropzone
                ref={dropzoneRef}
                onDrop={this._handleFileSelected}
                multiple={false}
                noClick
                noKeyboard
            >
                {this._renderDropzoneContents}
            </Dropzone>
        );
    }

    private _renderDropzoneContents(state: DropzoneState): JSX.Element {

        const {
            children,
            variant,
            rows,
            rowsMax,
            label,
            value
        } = this.props;

        const {
            getRootProps,
            getInputProps,
            isDragActive
        } = state;

        return (
            <Box
                className={`${StyleClassPrefix}-root`}
                sx={StyleProps}
                {...getRootProps()}
            >
                {isDragActive && this._renderDragOverlay()}
                <input {...getInputProps()} />
                <TextField
                    multiline
                    fullWidth
                    variant={variant ?? DefaultTextareaVariant}
                    label={label}
                    rows={rows ?? DefaultTextareaRows}
                    maxRows={rowsMax}
                    value={value}
                    onChange={this._handleTextAreaChange}
                />
                {children}
            </Box>
        );

    }

    private _renderDragOverlay(): ReactNode {
        const { dragOverlayText, dragOverlayIcon } = this.props;
        const DragOverlayIcon = dragOverlayIcon ?? DefaultDragOverlayIcon;
        return (
            <div className={`${StyleClassPrefix}-drag-overlay`}>
                <DragOverlayIcon className={`${StyleClassPrefix}-drag-overlay-icon`} />
                <div className={`${StyleClassPrefix}-drag-overlay-text`}>
                    {dragOverlayText ?? DefaultDragOverlayText}
                </div>
            </div>
        );
    }

    private async _handleFileSelected(files: File[]): Promise<void> {
        const { onValueChange } = this.props;
        const currentValue = this.props.value;

        const selectedFile = files[0];
        const value = await selectedFile.text();

        if (value === currentValue) {
            return;
        }
        onValueChange && onValueChange(value);
    }

    private _handleTextAreaChange(event: ChangeEvent<HTMLInputElement>): void {
        const { onValueChange } = this.props;
        const { value } = event.target;

        onValueChange && onValueChange(value);
    }

};
