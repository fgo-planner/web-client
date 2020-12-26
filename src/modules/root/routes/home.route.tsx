import { RouteComponent } from 'internal';
import React, { Fragment, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type State = {
    test: string;
}

export class HomeRoute extends RouteComponent<{}, State> {

    constructor(props: {}) {
        super(props);
        this.state = {
            test: 'asdf'
        };
    }

    render(): ReactNode {
        console.log("Rendered")
        return (
            <Fragment>
                <h2>Home!</h2>
                <div>Welcome</div>
                <Link to="/resources">Resources</Link>
                <input name="one-way-binding" onChange={this.testHandler.bind(this)}/>
                <input name="two-way-binding" value={this.state.test} onChange={this.testHandler.bind(this)}/>
            </Fragment>
        );
    }

    testHandler(event: any) {
        this.setState({test: event.target.value});
    }

}
