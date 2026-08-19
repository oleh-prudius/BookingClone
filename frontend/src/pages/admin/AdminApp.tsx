import { Refine, Authenticated } from '@refinedev/core';
import {
  ThemedLayout,
  ThemedTitle,
  useNotificationProvider,
  AuthPage,
  ErrorComponent,
} from '@refinedev/antd';
import routerProvider, {
  CatchAllNavigate,
  NavigateToResource,
} from '@refinedev/react-router';
import { App as AntdApp, ConfigProvider } from 'antd';
import { Routes, Route, Outlet } from 'react-router-dom';
import '@refinedev/antd/dist/reset.css';

import { dataProvider } from '@shared/api/refineDataProvider';
import { authProvider } from '@shared/api/refineAuthProvider';
import { colors } from '@shared/theme/tokens';
import emblemUrl from '@shared/assets/triply-emblem.svg';
import './admin.css';

import { HotelList } from './hotels/HotelList';
import { HotelCreate } from './hotels/HotelCreate';
import { HotelEdit } from './hotels/HotelEdit';
import { BookingList } from './bookings/BookingList';
import { BookingShow } from './bookings/BookingShow';
import { CountryList } from './countries/CountryList';
import { CountryCreate } from './countries/CountryCreate';
import { CountryEdit } from './countries/CountryEdit';
import { CityList } from './cities/CityList';
import { CityCreate } from './cities/CityCreate';
import { CityEdit } from './cities/CityEdit';
import { CategoryList } from './categories/CategoryList';
import { CategoryCreate } from './categories/CategoryCreate';
import { CategoryEdit } from './categories/CategoryEdit';
import { RoomList } from './rooms/RoomList';
import { RoomCreate } from './rooms/RoomCreate';
import { RoomEdit } from './rooms/RoomEdit';
import { UserList } from './users/UserList';
import { UserEdit } from './users/UserEdit';
import { DashboardPage } from './dashboard/DashboardPage';

export function AdminApp() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            siderBg: colors.navyDarkest,
            headerBg: '#ffffff',
          },
          Menu: {
            darkItemBg: colors.navyDarkest,
            darkItemSelectedBg: colors.primary,
            darkItemColor: 'rgba(255, 255, 255, 0.75)',
            darkItemHoverColor: '#ffffff',
            darkItemSelectedColor: '#ffffff',
          },
        },
      }}
    >
    <AntdApp>
      <Refine
        routerProvider={routerProvider}
        dataProvider={dataProvider}
        authProvider={authProvider}
        notificationProvider={useNotificationProvider}
        resources={[
          {
            name: 'dashboard',
            list: '/admin/dashboard',
            meta: { label: 'Dashboard' },
          },
          {
            name: 'hotels',
            list: '/admin/hotels',
            create: '/admin/hotels/create',
            edit: '/admin/hotels/edit/:id',
            meta: { label: 'Hotels' },
          },
          {
            name: 'bookings/admin/all',
            list: '/admin/bookings',
            show: '/admin/bookings/show/:id',
            meta: { label: 'Bookings' },
          },
          {
            name: 'countries',
            list: '/admin/countries',
            create: '/admin/countries/create',
            edit: '/admin/countries/edit/:id',
            meta: { label: 'Countries' },
          },
          {
            name: 'cities',
            list: '/admin/cities',
            create: '/admin/cities/create',
            edit: '/admin/cities/edit/:id',
            meta: { label: 'Cities' },
          },
          {
            name: 'hotel-categories',
            list: '/admin/categories',
            create: '/admin/categories/create',
            edit: '/admin/categories/edit/:id',
            meta: { label: 'Categories' },
          },
          {
            name: 'rooms',
            list: '/admin/rooms',
            create: '/admin/rooms/create',
            edit: '/admin/rooms/edit/:id',
            meta: { label: 'Rooms' },
          },
          {
            name: 'users',
            list: '/admin/users',
            edit: '/admin/users/edit/:id',
            meta: { label: 'Users' },
          },
        ]}
        options={{ syncWithLocation: true }}
      >
        <Routes>
          <Route path="login" element={<AuthPage type="login" />} />

          <Route
            element={
              <Authenticated
                key="admin-auth"
                fallback={<CatchAllNavigate to="/admin/login" />}
              >
                <ThemedLayout
                  Title={({ collapsed }) => (
                    <ThemedTitle
                      collapsed={collapsed}
                      text="Triply Admin"
                      icon={<img src={emblemUrl} alt="" style={{ height: 24, width: 24 }} />}
                    />
                  )}
                >
                  <Outlet />
                </ThemedLayout>
              </Authenticated>
            }
          >
            <Route index element={<NavigateToResource resource="dashboard" />} />

            <Route path="dashboard" element={<DashboardPage />} />

            <Route path="hotels">
              <Route index element={<HotelList />} />
              <Route path="create" element={<HotelCreate />} />
              <Route path="edit/:id" element={<HotelEdit />} />
            </Route>

            <Route path="bookings">
              <Route index element={<BookingList />} />
              <Route path="show/:id" element={<BookingShow />} />
            </Route>

            <Route path="countries">
              <Route index element={<CountryList />} />
              <Route path="create" element={<CountryCreate />} />
              <Route path="edit/:id" element={<CountryEdit />} />
            </Route>

            <Route path="cities">
              <Route index element={<CityList />} />
              <Route path="create" element={<CityCreate />} />
              <Route path="edit/:id" element={<CityEdit />} />
            </Route>

            <Route path="categories">
              <Route index element={<CategoryList />} />
              <Route path="create" element={<CategoryCreate />} />
              <Route path="edit/:id" element={<CategoryEdit />} />
            </Route>

            <Route path="rooms">
              <Route index element={<RoomList />} />
              <Route path="create" element={<RoomCreate />} />
              <Route path="edit/:id" element={<RoomEdit />} />
            </Route>

            <Route path="users">
              <Route index element={<UserList />} />
              <Route path="edit/:id" element={<UserEdit />} />
            </Route>

            <Route path="*" element={<ErrorComponent />} />
          </Route>
        </Routes>
      </Refine>
    </AntdApp>
    </ConfigProvider>
  );
}
