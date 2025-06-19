import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./features/AuthContext.tsx";
import { ThemeProvider } from "./features/ThemeContext.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import NoteDetail from "./pages/NoteDetail.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import { Dashboard } from "./components/Dashboard.tsx";
import { PrivateRoute } from "./routes/Private.tsx";
import { PublicRoute } from "./routes/Public.tsx";
import { PageTransition } from "./components/PageTransition.tsx";
import { NoteCardGrid } from "./components/NoteCardGrid.tsx";
import SharedWithMePage from "./pages/SharedWithMePage.tsx";
import AttachmentsPage from "./pages/AttachmentsPage.tsx";
import BinPage from "./pages/BinPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";

const router = createBrowserRouter([
    {
      element: <PrivateRoute><Dashboard/></PrivateRoute>,
      children: [
        {
          path: "/",
          element: <PageTransition><NoteCardGrid/></PageTransition>,
        },
        {
          path: "/notes/:id",
          element: <PageTransition><NoteDetail/></PageTransition>,
        },
        {
          path: "/shared",
          element: <PageTransition><SharedWithMePage/></PageTransition>,
        },
        {
          path: "/attachments",
          element: <PageTransition><AttachmentsPage/></PageTransition>,
        },
        {
          path: "/trash",
          element: <PageTransition><BinPage/></PageTransition>,
        },
        {
          path: "/settings",
          element: <PageTransition><SettingsPage/></PageTransition>,
        },
      ],
    },
    {
      path: "/login",
      element: <PublicRoute><PageTransition><LoginPage/></PageTransition></PublicRoute>,
    },
    {
      path: "/register",
      element: <PublicRoute><PageTransition><RegisterPage/></PageTransition></PublicRoute>,
    },
  ]
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={ router }/>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;