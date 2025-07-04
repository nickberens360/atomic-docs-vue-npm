import { RouteRecordRaw } from 'vue-router';
import type { RouteLocationNormalized } from 'vue-router';

// Define interface for route parameters
interface ComponentDocRouteParams {
  componentName: string;
}

const routes: RouteRecordRaw[] = [
  {
    // This root path prevents initialization warnings and does not need meta data.
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
        // This is a dynamic route for component details, so it doesn't need to be in the main navigation.
        // No meta data is needed here.
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
        component: () => import('./views/DocsColorsView.vue'),
        // ✨ META DATA ADDED HERE
        meta: {
          section: 'Design System', // Groups this link under the "Design System" header
          title: 'Color System',    // The user-friendly display name
          icon: '🎨',               // The icon for the navigation link
        }
      },
      {
        path: 'typography',
        name: 'typography',
        component: () => import('./views/DocsTypography.vue'),
        // ✨ META DATA ADDED HERE
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