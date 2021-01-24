import { Menu, MenuProps, PaperProps, PopoverClassKey, StyleRules, withStyles } from '@material-ui/core';
import { WithStylesProps } from 'internal';
import React, { MouseEvent, PureComponent, ReactNode } from 'react';

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

export const HoverMenu = withStyles(style)(class extends PureComponent<Props, State> {

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

    componentDidUpdate(prevProps: Props) {
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

    componentWillUnmount() {
        this._isMounted = false;
    }

    render(): ReactNode {
        const { classes } = this.props;
        const { open } = this.state;
        const props = this._sanitizeProps(this.props);
        return (
            <Menu {...props}
                  classes={{ paper: classes.paper }}
                  open={open}
                  PopoverClasses={this._popoverClasses}
                  PaperProps={this._generatePaperProps()}
                  keepMounted
            />
        );
    }

    /**
     * Removes custom prop keys that are not handled correctly by the `Menu`
     * component.
     */
    private _sanitizeProps(props: Props): Partial<Props> {
        const result: Partial<Props> = { ...props };
        delete result.classes;
        delete result.closeDelay;
        delete result.forceClosed;
        return result;
    }

    private _generatePaperProps(): PaperProps {
        const { PaperProps } = this.props;
        return {
            ...PaperProps,
            onMouseEnter: this._handleMouseEnter,
            onMouseLeave: this._handleMouseLeave
        };
    }

    private _handleMouseEnter(event: MouseEvent) {
        /*
         * Need to set timeout here because the mouse enter event fires before the
         * componentDidUpdate` method.
         */
        setTimeout(() => {
            this._closeRequested = false;
        });
    }

    private _handleMouseLeave(event: MouseEvent) {
        this._closeRequested = true;
        this._closeAfterDelay();
    }

    private _closeAfterDelay() {
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
