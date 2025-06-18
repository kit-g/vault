import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage.tsx";
import NoteDetail from "./pages/NoteDetail.tsx";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {AuthProvider} from "./features/AuthContext.tsx";
import {PrivateRoute} from "./routes/Private.tsx";
import {PublicRoute} from "./routes/Public.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import {AnimatePresence} from "framer-motion";
import {ThemeProvider} from "./features/ThemeContext.tsx";
import {PageTransition} from "./components/PageTransition.tsx";

function AnimatedRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><PrivateRoute><Dashboard/></PrivateRoute></PageTransition>}/>
        <Route path="/note/:id" element={<PageTransition><PrivateRoute><NoteDetail/></PrivateRoute></PageTransition>}/>
        <Route path="/login" element={<PageTransition><PublicRoute><LoginPage/></PublicRoute></PageTransition>}/>
        <Route path="/register" element={<PageTransition><PublicRoute><RegisterPage/></PublicRoute></PageTransition>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AnimatedRoutes/>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
