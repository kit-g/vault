import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {AuthProvider} from "./features/AuthContext.tsx";
import {ThemeProvider} from "./features/ThemeContext.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import NoteDetail from "./pages/NoteDetail.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import {DashboardLayout} from "./components/DashboardLayout.tsx";
import {PrivateRoute} from "./routes/Private.tsx";
import {PublicRoute} from "./routes/Public.tsx";
import {PageTransition} from "./components/PageTransition.tsx";
import {NoteCardGrid} from "./components/NoteCardGrid.tsx";

const router = createBrowserRouter([
    {
      element: (
        <PrivateRoute>
          <DashboardLayout/>
        </PrivateRoute>
      ),
      children: [
        {
          path: "/",
          element: (
            <PageTransition>
              <NoteCardGrid/>
            </PageTransition>
          ),
        },
        {
          path: "/note/:id",
          element: (
            <PrivateRoute>
              <PageTransition>
                <NoteDetail/>
              </PageTransition>
            </PrivateRoute>
          ),
        }
      ],
    },
    {
      path: "/login",
      element: (
        <PublicRoute>
          <PageTransition>
            <LoginPage/>
          </PageTransition>
        </PublicRoute>
      ),
    },
    {
      path: "/register",
      element: (
        <PublicRoute>
          <PageTransition>
            <RegisterPage/>
          </PageTransition>
        </PublicRoute>
      ),
    },
  ]
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router}/>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;