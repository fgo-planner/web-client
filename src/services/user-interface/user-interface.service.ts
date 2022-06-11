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

    private readonly _NavigationDrawerNoAnimationsInvocationIdSet = new Set<string>();

    private _loadingIndicatorActive = false;

    private _appBarElevated = false;

    private _navigationDrawerNoAnimations = false;

    private _navigationDrawerOpen = false;

    private _loginDialogOpen = false;

    private get _onLoadingIndicatorActiveChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.LoadingIndicatorActiveChange);
    }

    private get _onAppBarElevatedChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.AppBarElevatedChange);
    }

    private get _onNavigationDrawerOpenChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.NavigationDrawerOpenChange);
    }

    private get _onNavigationDrawerNoAnimationsChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.NavigationDrawerNoAnimationsChange);
    }

    private get _onLoginDialogOpenChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.LoginDialogOpenChange);
    }

    invokeLoadingIndicator(): string {
        const invocationId = String(new Date().getTime());
        this._LoadingIndicatorInvocationIdSet.add(invocationId);
        if (!this._loadingIndicatorActive) {
            this._onLoadingIndicatorActiveChange.next(this._loadingIndicatorActive = true);
        }
        return invocationId;
    }

    waiveLoadingIndicator(invocationId: string): void {
        this._LoadingIndicatorInvocationIdSet.delete(invocationId);
        if (!this._LoadingIndicatorInvocationIdSet.size) {
            this._onLoadingIndicatorActiveChange.next(this._loadingIndicatorActive = false);
        }
    }

    invokeAppBarElevation(): string {
        const invocationId = String(new Date().getTime());
        this._AppBarElevateInvocationIdSet.add(invocationId);
        if (!this._appBarElevated) {
            this._onAppBarElevatedChange.next(this._appBarElevated = true);
        }
        return invocationId;
    }

    waiveAppBarElevation(invocationId: string): void {
        this._AppBarElevateInvocationIdSet.delete(invocationId);
        if (!this._AppBarElevateInvocationIdSet.size) {
            this._onAppBarElevatedChange.next(this._appBarElevated = false);
        }
    }

    invokeNavigationDrawerNoAnimations(): string {
        const invocationId = String(new Date().getTime());
        this._NavigationDrawerNoAnimationsInvocationIdSet.add(invocationId);
        if (!this._navigationDrawerNoAnimations) {
            this._onNavigationDrawerNoAnimationsChange.next(this._navigationDrawerNoAnimations = true);
        }
        return invocationId;
    }

    waiveNavigationDrawerNoAnimations(invocationId: string): void {
        this._NavigationDrawerNoAnimationsInvocationIdSet.delete(invocationId);
        if (!this._NavigationDrawerNoAnimationsInvocationIdSet.size) {
            this._onNavigationDrawerNoAnimationsChange.next(this._navigationDrawerNoAnimations = false);
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

    setLoginDialogOpen(open: boolean): void {
        if (this._loginDialogOpen === open) {
            return;
        }
        this._loginDialogOpen = open;
        this._onLoginDialogOpenChange.next(open);
    }

}
