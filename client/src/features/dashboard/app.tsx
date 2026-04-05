import { FriendMessageProvider } from "../messages/contexts/MessageContext";
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