import { Menu, MenuProps, PaperProps, PopoverClassKey, StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { PureComponent, ReactNode } from 'react';
import { WithStylesProps } from '../../types/internal';

type Props = {
    closeDelay?: number;
    forceClosed?: boolean;
} & MenuProps & WithStylesProps;

type State = {
    open: boolean;
};

const style = () => ({
    root: {
        pointerEvents: 'none'
    },
    paper: {
        pointerEvents: 'initial'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'HoverMenu'
};

export const HoverMenu = withStyles(style, styleOptions)(class extends PureComponent<Props, State> {

    private readonly _popoverClasses: Partial<Record<PopoverClassKey, string>>;

    private _closeRequested = false;

    private _isMounted = true;

    constructor(props: Props) {
        super(props);

        this.state = {
            open: props.open
        };

        this._handleMouseEnter = this._handleMouseEnter.bind(this);
        this._handleMouseLeave = this._handleMouseLeave.bind(this);

        this._popoverClasses = { root: props.classes.root };
    }

    componentDidUpdate(prevProps: Props): void {
        const { open, forceClosed } = this.props;
        if (forceClosed) {
            if (!prevProps.forceClosed) {
                this.setState({
                    open: false
                });
            }
            return;
        }
        if (open) {
            this._closeRequested = false;
            this.setState({
                open: true
            });
        } else if (this.state.open && !this._closeRequested) {
            this._closeRequested = true;
            this._closeAfterDelay();
        }
    }

    componentWillUnmount(): void {
        this._isMounted = false;
    }

    render(): ReactNode {
        const { classes, closeDelay, forceClosed, ...menuProps } = this.props;
        const { open } = this.state;
        return (
            <Menu 
                {...menuProps}
                classes={{ paper: classes.paper }}
                open={open}
                PopoverClasses={this._popoverClasses}
                PaperProps={this._generatePaperProps()}
                keepMounted
            />
        );
    }

    private _generatePaperProps(): PaperProps {
        const { PaperProps } = this.props;
        return {
            ...PaperProps,
            onMouseEnter: this._handleMouseEnter,
            onMouseLeave: this._handleMouseLeave
        };
    }

    private _handleMouseEnter(): void {
        /*
         * Need to set timeout here because the mouse enter event fires before the
         * componentDidUpdate` method.
         */
        setTimeout(() => {
            this._closeRequested = false;
        });
    }

    private _handleMouseLeave(): void {
        this._closeRequested = true;
        this._closeAfterDelay();
    }

    private _closeAfterDelay(): void {
        const { closeDelay } = this.props;
        setTimeout(() => {
            if (!this._closeRequested || !this._isMounted) {
                return;
            }
            this.setState({
                open: false
            });
        }, closeDelay || 0);
    }

});
