# Component Documentation Plugin

This plugin is intended to provide a framework for documenting usage of components. Any `.vue` file found within the `/components` directory will be added to the list of components to document. The component index page can be found at the route `/component-docs` when running the project in development mode.

## How to document a component

- Add a file of the same relative path as your component to the `/component-examples` directory. So if you are trying to document a component found in `/components/app/PageHeader.vue` then you would create the file `/component-examples/app/PageHeader.vue` and add your example usage to that file.
- Utilize the plugin's `<ExampleComponentUsage></ExampleComponentUsage>` component to wrap your examples. This component provides a default slot for your example, as well as an `actions` slot for any controls you want to add for the example, and a `description` slot for describing what your component does and how it works.
- Make sure that you are documenting the available props and slots for your component and ideally providing an interface for developers to interact with those props. e.g. if your component has a prop called `backgroundColor` then you would provide and input or select box that would update that prop in real time.


## Configuration

Currently this plugin makes some assumptions about project folder structure. Components to be documented should be in the `components` directory at the root of the `@` alias for the project and the documentation for those components should be in the `component-examples` directory at the root of the `@` alias for the project.

You will need to add the documentation routes to your router, the can be imported from the plugin's `routes.ts` file.

## Dependencies

- Vuetify
- VueRouter
- Vite

## Testing

This plugin uses Vitest for testing components. The following test commands are available:

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode (tests rerun when files change)
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ui` - Run tests with the Vitest UI interface

### Vitest UI

Vitest UI provides a graphical interface for running and debugging tests. To use it:

1. Run `npm run test:ui` in the component-documentation directory
2. A browser window will open with the Vitest UI interface
3. Use the interface to run specific tests, view test results, and debug failures

The UI provides features like:
- Interactive test explorer
- Real-time test feedback
- Detailed error reporting
- Test filtering
- Time travel debugging
