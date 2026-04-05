import { MessageProvider } from "../messages/contexts/MessageContext";
import { AsideMenuLayout } from "./layouts/AsideMenuLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";

export function DashboardApp() {


    return (

        <MessageProvider>

            <AsideMenuLayout>

                <DashboardLayout />
                
            </AsideMenuLayout>

        </MessageProvider>

    )
}