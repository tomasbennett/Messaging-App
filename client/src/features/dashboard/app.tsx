import { Outlet } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";

export function DashboardApp() {


    return (


        <DashboardLayout>

            <Outlet />

        </DashboardLayout>


    )
}