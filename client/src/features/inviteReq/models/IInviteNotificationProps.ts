export type IPopupNotificationProps = {
    bcg: string,
    message: string,
    onClick?: (e: React.MouseEvent) => void | Promise<void>,
}