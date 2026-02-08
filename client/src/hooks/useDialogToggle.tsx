import React, { useRef } from "react";


export function useDialogToggle() {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const openDialog = () => {
        dialogRef.current?.showModal();
        dialogRef.current?.setAttribute("data-animation-opening", "true");
    };

    const closeDialog = (postCloseAction?: () => void) => {
        dialogRef.current?.setAttribute("data-animation-opening", "false");
        dialogRef.current?.addEventListener("animationend", () => {
            
            dialogRef.current?.close();
            if (postCloseAction) {
                postCloseAction();
            }
            // setDialogContentState(null);
        }, { once: true });
        
    };

    const handleClickOutside = (
        event: React.MouseEvent<HTMLDialogElement>,
        postCloseAction?: () => void
    ) => {
        if (!dialogRef.current) return;

        const rect = dialogRef.current.getBoundingClientRect();
        const { clientX: x, clientY: y } = event;
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            closeDialog(postCloseAction);
        }
    }


    return {
        dialogRef,

        openDialog,
        closeDialog,
        handleClickOutside
    }
}