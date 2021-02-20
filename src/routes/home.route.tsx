import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

export const HomeRoute = React.memo(() => (
    <Fragment>
        <h2>Home!</h2>
        <div>Welcome</div>
        <Link to="/resources">Resources</Link>
    </Fragment>
));
