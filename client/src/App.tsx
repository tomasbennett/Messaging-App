
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { GeneralHomeLayout } from './layouts/GeneralHomeLayout'
import { SignInLayout } from './features/auth/layouts/SignInLayout'
import { NotAuthenticatedRoute, ProtectedRoute } from './features/auth/services/ProtectedRoute'
import { ErrorElement } from './features/error/services/ErrorElement'
import { ErrorPageLayout } from './features/error/layouts/ErrorLayout'
import { DashboardLayout } from './features/dashboard/layouts/DashboardLayout'
import { useEffect } from 'react'
import { SocketIOHandler } from './services/SocketIOHandler'
import { SocketProvider } from './contexts/SocketHandlerContext'


const router = createBrowserRouter([
  {
    path: "/",
    element: <GeneralHomeLayout />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: "error",
        element: <ErrorPageLayout />,
      },
      {
        element: <NotAuthenticatedRoute />,
        children: [
          {
            element: <SignInLayout />,
            children: [
              {
                path: "login",
                handle: {
                  title: "Login",
                }
              },
              {
                path: "register",
                handle: {
                  title: "Register",
                }
              }
            ]
          }
        ]
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <DashboardLayout />,
          }
        ]
      }
    ]
  }
]);






function App() {


  return (
    <>
      {/* <SocketProvider> */}
        <RouterProvider router={router} />
      {/* </SocketProvider> */}
    </>
  )
}

export default App
