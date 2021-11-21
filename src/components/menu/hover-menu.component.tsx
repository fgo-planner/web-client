import { Menu, MenuProps, PaperProps } from '@mui/material';
import { CSSProperties, PureComponent, ReactNode } from 'react';

type Props = {
    closeDelay?: number;
    forceClosed?: boolean;
} & MenuProps;

type State = {
    open: boolean;
};

const styles = {
    root: {
        pointerEvents: 'none'
    } as CSSProperties,
    paper: {
        pointerEvents: 'initial'
    } as CSSProperties
};

// TODO Convert this to functional component
export const HoverMenu = class extends PureComponent<Props, State> {

    private _closeRequested = false;

    private _isMounted = true;

    constructor(props: Props) {
        super(props);

        this.state = {
            open: props.open
        };

        this._handleMouseEnter = this._handleMouseEnter.bind(this);
        this._handleMouseLeave = this._handleMouseLeave.bind(this);
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
        const { closeDelay, forceClosed, ...menuProps } = this.props;
        const { open } = this.state;
        return (
            <Menu 
                {...menuProps}
                style={styles.root}
                open={open}
                PaperProps={this._generatePaperProps()}
                keepMounted
            />
        );
    }

    private _generatePaperProps(): PaperProps {
        const { PaperProps } = this.props;
        return {
            ...PaperProps,
            style: styles.paper,
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

};
