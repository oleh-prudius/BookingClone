import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@features/auth';
import { FavoritesProvider } from '@features/favorites';
import { ChatNotificationsProvider } from '@features/chat';
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
import { TransportPage } from '@pages/transport';
import { MyTicketsPage } from '@pages/tickets';
import { NearbyPage } from '@pages/nearby';
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
              <ChatNotificationsProvider>
                <div className="site-shell">
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
                    <Route path="/tickets" element={<MyTicketsPage />} />
                    <Route path="/transport" element={<TransportPage />} />
                    <Route path="/nearby" element={<NearbyPage />} />
                    <Route path="/about" element={<ComingSoonPage titleKey="footer.about" />} />
                    <Route path="/careers" element={<ComingSoonPage titleKey="footer.careers" />} />
                    <Route path="/contact" element={<ComingSoonPage titleKey="footer.contact" />} />
                    <Route path="/help" element={<ComingSoonPage titleKey="footer.help" />} />
                    <Route path="/terms" element={<ComingSoonPage titleKey="footer.terms" />} />
                    <Route path="/privacy" element={<ComingSoonPage titleKey="footer.privacy" />} />
                    <Route path="*" element={<Page404 />} />
                  </Routes>
                </main>
                <Footer />
                </div>
              </ChatNotificationsProvider>
              </FavoritesProvider>
            </AuthProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
