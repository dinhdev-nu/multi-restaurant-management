import { Route } from 'react-router-dom';
import NewRestaurantPage from '@/pages/new/NewRestaurantPage';

export const NEW_RESTAURANT_ROUTE_PATH = '/restaurants/new';

export function NewRestaurantRoute() {
    return <Route path={NEW_RESTAURANT_ROUTE_PATH} element={<NewRestaurantPage />} />;
}