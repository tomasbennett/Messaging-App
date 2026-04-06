import { FriendMessageProvider } from "../messages/contexts/FriendMessageContext";
import { AsideMenuLayout } from "./layouts/AsideMenuLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";

export function DashboardApp() {


    return (

        <FriendMessageProvider>

            <AsideMenuLayout>

                <DashboardLayout />
                
            </AsideMenuLayout>

        </FriendMessageProvider>

    )
}