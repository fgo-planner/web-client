
import { fade, StyleRules, TextField, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { FileCopy as FileCopyIcon, SvgIconComponent } from '@material-ui/icons';
import clsx from 'clsx';
import React, { ChangeEvent, PropsWithChildren, PureComponent, ReactNode } from 'react';
import Dropzone, { DropzoneRef, DropzoneState } from 'react-dropzone';
import { ThemeConstants } from '../../styles/theme-constants';
import { ComponentStyleProps, WithStylesProps } from '../../types';

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
}> & ComponentStyleProps & WithStylesProps;

const DefaultTextareaVariant = 'outlined';

const DefaultTextareaRows = 10;

const DefaultDragOverlayIcon = FileCopyIcon;

const DefaultDragOverlayText = 'Drop your file here';

const style = (theme: Theme) => ({
    root: {
        position: 'relative',
        width: '100%',
        padding: theme.spacing(4),
        boxSizing: 'border-box'
    },
    dragOverlay: {
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
        borderRadius: theme.spacing(2),
        backgroundColor: fade(theme.palette.primary.light, 0.1),
        opacity: 0.69
    },
    dragOverlayIcon: {
        fontSize: '4rem',
        paddingBottom: theme.spacing(4)
    },
    dragOverlayText: {
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontSize: '2rem',
        // color: theme.palette.text.secondary
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'FileInputWithTextarea'
};

/**
 * For inputting plain-text data, via file or input field. Includes a drop area
 * for file drag-and-drop.
 */
export const FileInputWithTextarea  = withStyles(style, styleOptions)(class extends PureComponent<Props> {

    constructor(props: Props) {
        super(props);

        this._renderDropzoneContents = this._renderDropzoneContents.bind(this);
        this._handleFileSelected = this._handleFileSelected.bind(this);
        this._handleTextAreaChange = this._handleTextAreaChange.bind(this);
    }

    render(): ReactNode {
        const { dropzoneRef } = this.props;
        return (
            <Dropzone ref={dropzoneRef} noClick noKeyboard multiple={false} onDrop={this._handleFileSelected}>
                {this._renderDropzoneContents}
            </Dropzone>
        );
    }

    private _renderDropzoneContents(state: DropzoneState): JSX.Element {

        const { 
            children,
            classes,
            className,
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
        
        const classNames = clsx(classes.root, className);

        return (
            <div className={classNames} {...getRootProps()}>
                {isDragActive && this._renderDragOverlay()}
                <input {...getInputProps()} />
                <TextField
                    multiline
                    fullWidth
                    variant={variant ?? DefaultTextareaVariant}
                    label={label}
                    rows={rows ?? DefaultTextareaRows}
                    rowsMax={rowsMax}
                    value={value}
                    onChange={this._handleTextAreaChange}
                />
                {children}
            </div>
        );

    }

    private _renderDragOverlay(): ReactNode {
        const { classes, dragOverlayText, dragOverlayIcon } = this.props;
        const DragOverlayIcon = dragOverlayIcon ?? DefaultDragOverlayIcon;
        return (
            <div className={classes.dragOverlay}>
                <DragOverlayIcon className={classes.dragOverlayIcon} />
                <div className={classes.dragOverlayText}>
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

});
