import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./app/login/page";
import Layout from "./components/Layout/Layout";
import { RequireAdmin } from "./components/auth/RequireAdmin";
import { RequireAuth } from "./components/auth/RequireAuth";
import { RootIndexRedirect } from "./components/auth/RootIndexRedirect";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<RootIndexRedirect />} />
            <Route element={<RequireAdmin />}>
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
