import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PageMetadata } from './components/utils/page-metadata.component';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { RootModule as AppRoot } from './root.module';
import { BackgroundMusicService } from './services/audio/background-music.service';
import { SoundtrackPlayerService } from './services/audio/soundtrack-player.service';
import { AuthenticationService } from './services/authentication/authentication.service';
import { WebAuthenticationService } from './services/authentication/web-authentication.service';
import { GameItemService } from './services/data/game/game-item.service';
import { GameServantService } from './services/data/game/game-servant.service';
import { GameSoundtrackService } from './services/data/game/game-soundtrack.service';
import { MasterAccountService } from './services/data/master/master-account.service';
import { PlanService } from './services/data/plan/plan.service';
import { UserService } from './services/data/user/user.service';
import { WebUserService } from './services/data/user/web-user.service';
import { AppBarService } from './services/user-interface/app-bar.service';
import { LoadingIndicatorOverlayService } from './services/user-interface/loading-indicator-overlay.service';
import { PageMetadataService } from './services/user-interface/page-metadata.service';
import { ThemeService } from './services/user-interface/theme.service';
import './styles/styles.scss';
import { InjectablesContainer } from './utils/dependency-injection/injectables-container';

const RootElementId = 'root';

// TODO Maybe move this to a separate file.
InjectablesContainer.registerInjectables(
    /*
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
    /*
     * audio
     */
    BackgroundMusicService,
    SoundtrackPlayerService,
    /*
     * game
     */
    GameItemService,
    GameServantService,
    GameSoundtrackService,
    /*
     * master
     */
    MasterAccountService,
    /*
     * planner
     */
    PlanService,
    /*
     * user-interface
     */
    AppBarService,
    LoadingIndicatorOverlayService,
    PageMetadataService,
    ThemeService
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
