import { CreateRestaurantProvider } from '@/features/new/FormProvider';
import { NewRestaurantLayout } from '@/layouts/new/NewRestaurantLayout';

export default function NewRestaurantPage() {
    return (
        <CreateRestaurantProvider>
            <NewRestaurantLayout />
        </CreateRestaurantProvider>
    );
}