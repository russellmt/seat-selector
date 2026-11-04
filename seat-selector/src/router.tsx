import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import SeatCanvas from './pages/SeatCanvas';
import GuestArrangement from './pages/GuestArrangement';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/canvas',
    element: <SeatCanvas />,
  },
  {
    path: '/arrangement',
    element: <GuestArrangement />,
  },
]);
