import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage.tsx";
import NoteDetail from "./pages/NoteDetail.tsx";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {AuthProvider} from "./features/AuthContext.tsx";
import {PrivateRoute} from "./routes/Private.tsx";
import {PublicRoute} from "./routes/Public.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import {ThemeProvider} from "./features/ThemeContext.tsx";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
            <Route path="/note/:id" element={<PrivateRoute><NoteDetail/></PrivateRoute>}/>
            <Route path="/login" element={<PublicRoute><LoginPage/></PublicRoute>}/>
            <Route path="/register" element={<PublicRoute><RegisterPage/></PublicRoute>}/>
            <Route path="*" element={<Navigate to="/" replace/>}/>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
