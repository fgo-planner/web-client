import { UserGlobalPreferences } from './user-global-preferences.type';
import { UserWebClientPreferences } from './user-web-client-preferences.type';

export type UserPreferences  = {

    global: UserGlobalPreferences;

    webClient: UserWebClientPreferences;

};
