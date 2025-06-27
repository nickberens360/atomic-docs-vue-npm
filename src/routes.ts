import { RouteRecordRaw } from 'vue-router';
import type { RouteLocationNormalized } from 'vue-router';

// Define interface for route parameters
interface ComponentDocRouteParams {
  componentName?: string; // Make optional as it might be missing on initial /atomic-docs/ route
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
      // Add a redirect for the base /atomic-docs path to the component index,
      // or to a default component if you have one.
      // This ensures a valid route is always active under /atomic-docs if no specific component is chosen.
      {
        path: '', // Matches /atomic-docs exactly
        redirect: { name: 'componentIndex' } // Redirect to DocsComponentIndex view
      },
      {
        path: ':componentName', // This is where the componentName parameter is expected
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
      // Define a component index route for the base /atomic-docs path
      {
        path: 'index', // Explicitly define an index route
        name: 'componentIndex',
        component: () => import('./views/DocsComponentIndex.vue') // Or a new `DocsComponentListing` view
      }
    ]
  }
];

export default routes;