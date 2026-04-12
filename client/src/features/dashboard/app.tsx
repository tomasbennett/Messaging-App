import { Outlet } from "react-router-dom";
import { FriendMessageProvider } from "../messages/contexts/PreviewFriendConversationContext";
import { AsideMenuLayout } from "./layouts/AsideMenuLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";

export function DashboardApp() {


    return (


        <DashboardLayout>

            <Outlet />

        </DashboardLayout>


    )
}