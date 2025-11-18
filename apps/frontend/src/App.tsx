import {
	Navigate,
	RouterProvider,
	createBrowserRouter,
} from 'react-router-dom';
import { Moto } from './page/Moto';
import { MainPage } from './page/MainPage';
import { Car } from './page/Car';
import { Home } from './page/Home';

const router = createBrowserRouter([
	{
		path: '/',
		element: <MainPage />,
	},
	{
		path: '/moto',
		element: <Moto />,
	},
	{
		path: '/car',
		element: <Car />,
	},
	{
		path: '/home',
		element: <Home />,
	},
	{
		path: '*',
		element: <MainPage />,
	},
]);

export function App() {
	return <RouterProvider router={router} />;
}
