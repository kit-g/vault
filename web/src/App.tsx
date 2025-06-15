import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage.tsx";
import NoteDetail from "./pages/NoteDetail.tsx";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {AuthProvider} from "./features/AuthContext.tsx";
import {PrivateRoute} from "./routes/Private.tsx";
import {PublicRoute} from "./routes/Public.tsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
          <Route path="/note/:id" element={<PrivateRoute><NoteDetail/></PrivateRoute>}/>
          <Route path="/login" element={<PublicRoute><LoginPage/></PublicRoute>}/>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
