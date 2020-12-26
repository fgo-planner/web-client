import React, { PureComponent, ReactNode } from 'react';
import './theme-background.component.scss';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

type Props = {

    /**
     * Background image URL. Overrides background color.
     */
    imageUrl?: string | null;

    /**
     * Solid background color. Only used if no background image URL is provided.
     */
    color?: string | null;

    /**
     * Background opacity.
     */
    opacity?: number | null;

    /**
     * Background image blur.
     */
    blur?: number | null;

};

type State = {

};

export class ThemeBackground extends PureComponent<Props, State> {

    render(): ReactNode {
        return (
            <div className="background-container">
                <div className="background" style={this.backgroundStyle}>

                </div>
            </div>
        );
    }

    private get backgroundStyle(): CSSProperties {
        const props = this.props;
        const style: CSSProperties = {
            backgroundColor: props.color || undefined
        };
        if (props.imageUrl) {
            style.backgroundImage = `url(${props.imageUrl})`;
            if (props.blur) {
                style.backdropFilter = `blur(${props.blur}px)`;
            }
        }
        if (props.opacity != null) {
            style.opacity = props.opacity;
        }
        return style;
    }

}
