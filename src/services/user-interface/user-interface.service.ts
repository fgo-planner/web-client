import { Injectable } from '../../decorators/dependency-injection/injectable.decorator';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../utils/subscription/subscription-topics';

/**
 * Central hub for reading and writing the states of 'global' UI components,
 * such as loading indicator, navigation elements, and various dialog boxes.
 */
@Injectable
export class UserInterfaceService {

    private readonly _LoadingIndicatorInvocationIdSet = new Set<string>();
    
    private readonly _AppBarElevateInvocationIdSet = new Set<string>();

    private _loadingIndicatorActive = false;

    private _appBarElevated = false;

    private _navigationDrawerOpen = false;

    private get _onLoadingIndicatorActiveChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.LoadingIndicatorActiveChange);
    }

    private get _onAppBarElevatedChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.AppBarElevatedChange);
    }

    private get _onNavigationDrawerOpenChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.NavigationDrawerOpenChange);
    }

    invokeLoadingIndicator(): string {
        const id = String(new Date().getTime());
        this._LoadingIndicatorInvocationIdSet.add(id);
        if (!this._loadingIndicatorActive) {
            this._onLoadingIndicatorActiveChange.next(this._loadingIndicatorActive = true);
        }
        return id;
    }

    waiveLoadingIndicator(id: string): void {
        this._LoadingIndicatorInvocationIdSet.delete(id);
        if (!this._LoadingIndicatorInvocationIdSet.size) {
            this._onLoadingIndicatorActiveChange.next(this._loadingIndicatorActive = false);
        }
    }

    invokeAppBarElevation(): string {
        const id = String(new Date().getTime());
        this._AppBarElevateInvocationIdSet.add(id);
        if (!this._appBarElevated) {
            this._onAppBarElevatedChange.next(this._appBarElevated = true);
        }
        return id;
    }

    waiveAppBarElevation(id: string): void {
        this._AppBarElevateInvocationIdSet.delete(id);
        if (!this._AppBarElevateInvocationIdSet.size) {
            this._onAppBarElevatedChange.next(this._appBarElevated = false);
        }
    }

    setNavigationDrawerOpen(open: boolean): void {
        if (this._navigationDrawerOpen === open) {
            return;
        }
        this._navigationDrawerOpen = open;
        this._onNavigationDrawerOpenChange.next(open);
    }

    toggleNavigationDrawerOpen(): void {
        this._navigationDrawerOpen = !this._navigationDrawerOpen;
        this._onNavigationDrawerOpenChange.next(this._navigationDrawerOpen);
    }

}
