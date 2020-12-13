import React, { PureComponent, ReactNode } from 'react';
import { Button } from '@material-ui/core';

type State = {
    appBarElevated: boolean;
};

export class AppBar extends PureComponent<{}, State> {

    render(): ReactNode {
        return (
            <div className="app-bar-container">
                AppBar
                <Button>
                    Hello?
                </Button>
            </div>
        );
    }

}
