import { RouteObject } from 'react-router-dom';
import { Home } from '../pages/Home';
import { RoutePath } from './path';
import { Root } from '../pages/Root';
import { Layout } from '../components/Layout';

export const routers: RouteObject[] = [
  {
    path: RoutePath.Root,
    element: <Layout />,
    hasErrorBoundary: true,
    children: [
      {
        path: RoutePath.Root,
        element: <Root />,
      },
      {
        path: RoutePath.Home,
        element: <Home />,
      },
    ],
  },
];
