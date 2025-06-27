// nickberens360/atomic-docs-vue-npm/atomic-docs-vue-npm-consumer-app-id/src/routes.ts
import { RouteRecordRaw } from 'vue-router';
import type { RouteLocationNormalized } from 'vue-router';

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
    // CHANGED: This path should now be '/' because createWebHistory('/atomic-docs') handles the prefix
    path: '/', // <--- CRITICAL CHANGE: Was '/atomic-docs'
    name: 'componentDocs',
    component: () => import('./views/DocsHomeView.vue'),
    children: [
      {
        path: ':componentName', // This will now resolve to /atomic-docs/:componentName
        name: 'componentDoc',
        component: () => import('./views/DocsComponentDetails.vue'),
        props: (route: RouteLocationNormalized) => ({
          relativePath: route.query.relativePath as string | undefined,
          componentName: (route.params as unknown as ComponentDocRouteParams).componentName
        })
      },
      {
        path: 'colors', // This will now resolve to /atomic-docs/colors
        name: 'colors',
        component: () => import('./views/DocsColorsView.vue')
      },
      {
        path: 'typography', // This will now resolve to /atomic-docs/typography
        name: 'typography',
        component: () => import('./views/DocsTypography.vue')
      },
    ]
  }
];

export default routes;