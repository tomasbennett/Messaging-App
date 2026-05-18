import { Outlet } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";

export function DashboardApp({ children }: { children: React.ReactNode }) {


    return (


        <DashboardLayout>

            {
                children
            }

        </DashboardLayout>


    )
}