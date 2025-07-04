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
        path: 'design-system/colors',
        name: 'colors',
        component: () => import('./views/DocsColorsView.vue'),
        meta: {
          section: 'Design System', // Groups this link under the "Design System" header
          title: 'Color System',    // The user-friendly display name
          icon: '🎨',               // The icon for the navigation link
        }
      },
      {
        path: 'design-system/typography',
        name: 'typography',
        component: () => import('./views/DocsTypography.vue'),
        meta: {
          section: 'Design System',
          title: 'Typography',
          icon: '🔤',
        }
      },
    ]
  }
];

export default routes;