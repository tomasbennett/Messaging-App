
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { GeneralHomeLayout } from './layouts/GeneralHomeLayout'
import { SignInLayout } from './features/auth/layouts/SignInLayout'
import { NotAuthenticatedRoute, ProtectedRoute } from './features/auth/components/ProtectedRoute'
import { ErrorElement } from './features/error/services/ErrorElement'
import { ErrorPageLayout } from './features/error/layouts/ErrorLayout'
import { DashboardLayout } from './features/dashboard/layouts/DashboardLayout'
import { ErrorProvider } from './features/error/contexts/ErrorContext'
import { DashboardApp } from './features/dashboard/app'
import { AuthProvider } from './features/auth/contexts/AuthContext'
import { ConversationLayout } from './features/messages/layouts/Conversation'
import { NoConversationSelected } from './features/dashboard/components/NoConversationSelected'
import { AsideMenuLayout } from './features/dashboard/layouts/AsideMenuLayout'
import { FriendMessageProvider } from './features/messages/contexts/PreviewFriendConversationContext'
import { accountPageRoute, conversationPageRoute, myAccountPageRoute, newConversationPageRoute, singleConversationPageRoute } from './constants/routes'
import { NewConversationLayout } from './features/conversations/layouts/NewConversationLayout'


const router = createBrowserRouter([
  {
    path: "/",
    element:
      <AuthProvider>
        <GeneralHomeLayout />
      </AuthProvider>,
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
            element:
              <FriendMessageProvider>
                <AsideMenuLayout>
                  <Outlet />
                </AsideMenuLayout>
              </FriendMessageProvider>,
            children: [
              {
                element: <DashboardApp />,
                children: [
                  {
                    index: true,
                    element: <NoConversationSelected />
                  },
                  {
                    path: `${singleConversationPageRoute}`,
                    element: <ConversationLayout />
                  }
                ]
              },
              {
                path: newConversationPageRoute,
                element: <NewConversationLayout />
              },
              {
                path: accountPageRoute,
                element: <div>Account Settings Page</div>,
                children: [
                  {
                    index: true,
                    element: <Navigate to={myAccountPageRoute} replace={true} />
                  },
                  {
                    path: "me",
                    element: <div>My Account</div>
                  },
                  {
                    path: ":accountId",
                    element: <div>Other User Account</div>
                    //IF accountId === loggedInUserId => My Account???
                    //first issue is that it'll make a massive change to layout with I imagine a lot of if statements
                  }
                ]
              }

            ]
          },
        ]
      }
    ]
  }
]);






function App() {


  return (
    <>
      <ErrorProvider>

        {/* <AuthProvider> */}

        <RouterProvider router={router} />

        {/* </AuthProvider> */}

      </ErrorProvider>

    </>
  )
}

export default App
