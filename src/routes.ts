import { RouteRecordRaw } from 'vue-router';
import type { RouteLocationNormalized } from 'vue-router';

// Define interface for route parameters
interface ComponentDocRouteParams {
  componentName: string;
}

const routes: RouteRecordRaw[] = [
  {
    path: '/component-docs',
    name: 'componentDocs',
    component: () => import('./views/DocsComponentIndex.vue'),
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
