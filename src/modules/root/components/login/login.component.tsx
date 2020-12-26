import React, { PureComponent, ReactNode, Fragment } from 'react';
import { Input, TextField } from '@material-ui/core';

export class Login extends PureComponent {

    render(): ReactNode {
        return (
            <Fragment>
                <div>
                    <TextField label="Username" 
                               variant="outlined" 
                               id="username" 
                               name="username" />
                </div>
                <div>
                    <TextField label="Password" 
                               variant="outlined" 
                               id="password" 
                               name="password" 
                               type="password" />
                </div>
            </Fragment>
        );
    }

}
