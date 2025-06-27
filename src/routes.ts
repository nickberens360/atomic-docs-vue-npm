// src/routes.ts (within your atomic-docs plugin source)
import { RouteRecordRaw } from 'vue-router';
import type { RouteLocationNormalized } from 'vue-router';

// Define interface for route parameters
interface ComponentDocRouteParams {
  componentName: string;
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'docsRoot',
    component: { render: () => null },
  },
  {
    path: '/atomic-docs',
    name: 'componentDocs',
    component: () => import('./views/DocsHomeView.vue'), // This is correct
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
      },
      {
        path: 'typography',
        name: 'typography',
        component: () => import('./views/DocsTypography.vue')
      },
    ]
  }
];

export default routes;