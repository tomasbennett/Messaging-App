import { useEffect, useRef, useState } from "react";
import { ISidebarMessageHeader } from "../models/ISidebarMessageHeader";

export function useSidebarHeaderMode() {
    const [sidebarHeaderMode, setSidebarHeaderMode] = useState<ISidebarMessageHeader>("title");

    const sidebarContainerRef = useRef<HTMLDivElement | null>(null);

    const getSearchMode = () => {
        setSidebarHeaderMode("search");
    };

    const getTitleMode = (e: MouseEvent) => {
        if (sidebarContainerRef.current && !sidebarContainerRef.current.contains(e.target as Node)) {
            setSidebarHeaderMode("title");
        }

    }

    useEffect(() => {
        if (sidebarHeaderMode === "title") {
            return;
        }

        document.addEventListener("click", getTitleMode);

        return () => {
            document.removeEventListener("click", getTitleMode);
        };

    }, [sidebarHeaderMode]);

    return { sidebarHeaderMode, getSearchMode, sidebarContainerRef, setSidebarHeaderMode };
}