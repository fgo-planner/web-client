import { MapUtils } from '@fgo-planner/common-core';
import { Subject } from 'rxjs';
import { Injectable } from '../../decorators/dependency-injection/injectable.decorator';
import { GlobalDialog, NavigationBlockerDialogOptions } from '../../types/internal';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../utils/subscription/subscription-topics';

export enum LockableFeature {
    AppBarElevate,
    LoadingIndicator,
    NavigationDrawerNoAnimations
}

/**
 * Central hub for reading and writing the states of 'global' UI components,
 * such as loading indicator, navigation elements, and various dialog boxes.
 */
@Injectable
export class UserInterfaceService {

    private readonly _LockIdSets = new Map<LockableFeature, Set<string>>();

    private readonly _LockableFeaturesStates = new Map<LockableFeature, boolean>();

    private readonly _GlobalDialogOpenStates = new Map<GlobalDialog, boolean>();

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

    private get _onNavigationDrawerNoAnimationsChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.NavigationDrawerNoAnimationsChange);
    }

    private get _onGlobalDialogAction() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.GlobalDialogAction);
    }

    /**
     * @returns A unique ID that can be used to release the lock.
     */
    requestLock(feature: LockableFeature): string {
        const lockId = this._generateLockId();
        const lockIdSet = MapUtils.getOrDefault(this._LockIdSets, feature, () => new Set());
        lockIdSet.add(lockId);
        if (!this._LockableFeaturesStates.get(feature)) {
            this._LockableFeaturesStates.set(feature, true);
            const subject = this._getSubjectForLockableFeature(feature);
            this._pushChange(subject, true);
        }
        return lockId;
    }

    /**
     * Defaults to `false`.
     */
    releaseLock(feature: LockableFeature, lockId: string): void {
        const lockIdSet = this._LockIdSets.get(feature);
        lockIdSet?.delete(lockId);
        if (!lockIdSet?.size) {
            this._LockableFeaturesStates.set(feature, false);
            const subject = this._getSubjectForLockableFeature(feature);
            this._pushChange(subject, false);
        }
    }
    
    private _getSubjectForLockableFeature(feature: LockableFeature): Subject<boolean> {
        switch (feature) {
            case LockableFeature.AppBarElevate:
                return this._onAppBarElevatedChange;
            case LockableFeature.LoadingIndicator:
                return this._onLoadingIndicatorActiveChange;
            case LockableFeature.NavigationDrawerNoAnimations:
                return this._onNavigationDrawerNoAnimationsChange;
        }
    }

    private _generateLockId(): string {
        return String(new Date().getTime());
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

    /**
     * Requests to open the login dialog.
     */
    openLoginDialog(): boolean {
        const dialog = GlobalDialog.Login;
        if (!this._canGlobalDialogBeOpened(dialog)) {
            return false;
        }
        this._GlobalDialogOpenStates.set(dialog, true);
        const onClose = this._generateGlobalDialogOnCloseHandler(dialog);
        this._pushChange(this._onGlobalDialogAction, {
            dialog,
            onClose
        });
        return true;
    }

    /**
     * Requests to open the navigation blocker dialog.
     */
    openNavigationBlockerDialog(options: NavigationBlockerDialogOptions): boolean {
        const dialog = GlobalDialog.NavigationBlocker;
        if (!this._canGlobalDialogBeOpened(dialog)) {
            return false;
        }
        this._GlobalDialogOpenStates.set(dialog, true);
        const onClose = this._generateGlobalDialogOnCloseHandler(dialog);
        this._pushChange(this._onGlobalDialogAction, {
            dialog,
            onClose,
            options
        });
        return true;
    }

    private _canGlobalDialogBeOpened(dialog: GlobalDialog): boolean {
        for (const state of this._GlobalDialogOpenStates.values()) {
            if (state) {
                return false;
            }
        }
        return true;
    }

    private _generateGlobalDialogOnCloseHandler(dialog: GlobalDialog): () => void {
        return () => this._GlobalDialogOpenStates.set(dialog, false);
    }

    /**
     * Push a value to a subject asynchronously.
     * 
     * @param subject The subject to push to.
     * @param value The value to push
     */
    private _pushChange<T>(subject: Subject<T>, value: T): void {
        setTimeout(() => subject.next(value));
    }

}
