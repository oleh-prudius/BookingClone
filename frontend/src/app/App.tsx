import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@features/auth';
import { FavoritesProvider } from '@features/favorites';
import { Header } from '@widgets/header';
import { Footer } from '@widgets/footer';
import { HomePage } from '@pages/home';
import { HotelsPage } from '@pages/hotels';
import { HotelDetailPage } from '@pages/hotel';
import { BookingPage } from '@pages/booking';
import { LoginPage } from '@pages/login';
import { RegisterPage } from '@pages/register';
import { ProfilePage } from '@pages/profile';
import { MyBookingsPage } from '@pages/my-bookings';
import { FavoritesPage } from '@pages/favorites';
import { MessagesPage } from '@pages/messages';
import { HostDashboardPage, HostHotelDetailPage } from '@pages/host';
import { ConfirmEmailPage } from '@pages/confirm-email';
import { ForgotPasswordPage } from '@pages/forgot-password';
import { ResetPasswordPage } from '@pages/reset-password';
import { ResendConfirmationPage } from '@pages/resend-confirmation';
import { AdminApp } from '@pages/admin';
import { Page404 } from '@pages/Page404';
import { ComingSoonPage } from '@pages/coming-soon/ComingSoonPage';
import { UiKitPage } from '@pages/ui-kit';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route
          path="*"
          element={
            <AuthProvider>
              <FavoritesProvider>
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/hotels" element={<HotelsPage />} />
                    <Route path="/hotels/:id" element={<HotelDetailPage />} />
                    <Route path="/hotels/:id/book" element={<BookingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/confirm-email" element={<ConfirmEmailPage />} />
                    <Route path="/resend-confirmation" element={<ResendConfirmationPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/my-bookings" element={<MyBookingsPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/host" element={<HostDashboardPage />} />
                    <Route path="/host/hotels/:id" element={<HostHotelDetailPage />} />
                    <Route path="/ui-kit" element={<UiKitPage />} />
                    <Route path="/tickets" element={<ComingSoonPage titleKey="header.tickets" />} />
                    <Route path="/transport" element={<ComingSoonPage titleKey="header.transport" />} />
                    <Route path="/nearby" element={<ComingSoonPage titleKey="header.nearby" />} />
                    <Route path="*" element={<Page404 />} />
                  </Routes>
                </main>
                <Footer />
              </FavoritesProvider>
            </AuthProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
