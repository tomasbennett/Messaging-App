import { accessTokenLocalStorageKey } from "../../../constants/accessTokenLocalStorageKey";

let logoutFn: (() => void) | undefined = undefined;

export function setLogoutFn(fn: () => void) {
    logoutFn = fn;
}

export function triggerLogout() {
    localStorage.removeItem(accessTokenLocalStorageKey);
    logoutFn?.();
}