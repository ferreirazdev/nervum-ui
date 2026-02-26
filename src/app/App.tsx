import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppLayout } from './layouts/AppLayout';
import { MapPageWithProvider } from '@/features/map';
import { LoginPage, RegisterPage } from '@/features/auth';
import { EnvironmentsPage } from '@/features/environments';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/environments" replace />} />
          <Route path="environments" element={<EnvironmentsPage />} />
          <Route path="environments/:envId" element={<MapPageWithProvider />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
