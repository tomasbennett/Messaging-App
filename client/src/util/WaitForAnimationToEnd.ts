export async function waitForAnimationEnd(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
        const handler = () => {
            element.removeEventListener("animationend", handler);
            resolve();
        };

        element.addEventListener("animationend", handler);
    });
}