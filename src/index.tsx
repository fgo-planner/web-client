import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { PageMetadata } from './components/utils/page-metadata.component';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { RootModule as AppRoot } from './root.module';
import './styles/styles.scss';

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
