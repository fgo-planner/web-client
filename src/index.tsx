import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { PageMetadata } from './components/utils/page-metadata.component';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { RootModule as AppRoot } from './root.module';
import { AuthenticationService } from './services/authentication/authentication.service';
import { WebAuthenticationService } from './services/authentication/web-authentication.service';
import { UserService } from './services/data/user/user.service';
import { WebUserService } from './services/data/user/web-user.service';
import './styles/styles.scss';
import { InjectablesContainer } from './utils/dependency-injection/injectables-container';

// Auth service should be first, followed by user service.
// TODO Maybe move this to a separate file.
InjectablesContainer.registerInjectables(
    {
        token: AuthenticationService,
        value: new WebAuthenticationService()
    },
    {
        token: UserService,
        value: new WebUserService()
    }
);

const element = (
    <React.StrictMode>
        <PageMetadata />
        <BrowserRouter>
            <AppRoot />
        </BrowserRouter>
    </React.StrictMode>
);

const container = document.getElementById('root');

ReactDOM.render(element, container);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
