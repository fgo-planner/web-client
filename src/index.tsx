import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PageMetadata } from './components/utils/PageMetadata';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { RootModule as AppRoot } from './RootModule';
import { BackgroundMusicService } from './services/audio/BackgroundMusicService';
import { SoundtrackPlayerService } from './services/audio/SoundtrackPlayerService';
import { AuthenticationService } from './services/authentication/AuthenticationService';
import { WebAuthenticationService } from './services/authentication/WebAuthenticationService';
import { GameItemService } from './services/data/game/GameItemService';
import { GameServantService } from './services/data/game/GameServantService';
import { GameSoundtrackService } from './services/data/game/GameSoundtrackService';
import { MasterAccountChangeListenerService } from './services/data/master/MasterAccountChangeListenerService';
import { MasterAccountService } from './services/data/master/MasterAccountService';
import { ScheduledMasterAccountChangeListenerService } from './services/data/master/ScheduledMasterAccountChangeListenerService';
import { PlanService } from './services/data/plan/PlanService';
import { UserService } from './services/data/user/UserService';
import { WebUserService } from './services/data/user/WebUserService';
import { PageMetadataService } from './services/user-interface/PageMetadataService';
import { ThemeService } from './services/user-interface/ThemeService';
import { UserInterfaceService } from './services/user-interface/UserInterfaceService';
import './styles/scss/styles.scss';
import { InjectablesContainer } from './utils/dependency-injection/InjectablesContainer';

const RootElementId = 'root';

// TODO Maybe move this to a separate file.
InjectablesContainer.registerInjectables(
    /**
     * AuthenticationService should come first, followed by UserService.
     */
    {
        token: AuthenticationService,
        value: new WebAuthenticationService()
    },
    {
        token: UserService,
        value: new WebUserService()
    },
    /**
     * audio
     */
    BackgroundMusicService,
    SoundtrackPlayerService,
    /**
     * game
     */
    GameItemService,
    GameServantService,
    GameSoundtrackService,
    /**
     * master
     */
    MasterAccountService,
    {
        token: MasterAccountChangeListenerService,
        value: new ScheduledMasterAccountChangeListenerService()
    },
    /**
     * planner
     */
    PlanService,
    /**
     * user-interface
     */
    PageMetadataService,
    ThemeService,
    UserInterfaceService
);

const rootNode: ReactNode = (
    <React.StrictMode>
        <PageMetadata />
        <BrowserRouter>
            <AppRoot />
        </BrowserRouter>
    </React.StrictMode>
);

const rootElement = document.getElementById(RootElementId);

if (!rootElement) {
    console.error(`Root element id='${RootElementId}' could not be found.`);
} else {
    ReactDOM.createRoot(rootElement).render(rootNode);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
