import { RouteRecordRaw } from 'vue-router';
import type { RouteLocationNormalized } from 'vue-router';

// Define interface for route parameters
interface ComponentDocRouteParams {
  componentName: string;
}

const routes: RouteRecordRaw[] = [
  {
    // This new route handles the root path '/' to prevent initialization warnings.
    // It renders nothing and has no effect on your application.
    path: '/',
    name: 'docsRoot',
    component: { render: () => null },
  },
  {
    path: '/component-docs',
    name: 'componentDocs',
    component: () => import('./views/DocsHomeView.vue'),
    children: [
      {
        path: ':componentName',
        name: 'componentDoc',
        component: () => import('./views/DocsComponentDetails.vue'),
        props: (route: RouteLocationNormalized) => ({
          relativePath: route.query.relativePath as string | undefined,
          componentName: (route.params as unknown as ComponentDocRouteParams).componentName
        })
      },
      {
        path: 'colors',
        name: 'colors',
        component: () => import('./views/DocsColorsView.vue')
      }
    ]
  }
];

export default routes;
