interface PropType {
  name: string;
}

interface Prop {
  type: PropType | PropType[];
  required?: boolean;
  default?: any;
}

interface Props {
  [key: string]: Prop;
}

interface Component {
  props?: Props;
  name?: string;
  prototype?: object;
  __vccOpts?: { props?: Props };
  setup?: Function;
  defaults?: any;
  type?: any;
  __proto__?: any;
  [key: string]: any; // Add index signature to allow string indexing
}

interface PropItem {
  name: string;
  type: string;
  required: string;
  default: string;
}

interface Header {
  title: string;
  key: string;
}

export function getPropType(prop: Prop): string {
  if (Array.isArray(prop.type)) {
    return prop.type.map(t => t.name).join(' | ');
  }
  return prop.type ? prop.type.name : 'Type Undefined';
}

export function getPropDefault(prop: Prop): string {
  if (prop.default === undefined) {
    return 'undefined';
  }
  if (typeof prop.default === 'function') {
    const defaultValue = prop.default();
    return JSON.stringify(defaultValue);
  }
  return JSON.stringify(prop.default);
}

export function generatePropsItems(component: Component): PropItem[] {
  if (!component) return [];

  // Try to extract props from various possible locations in the component object
  let extractedProps: PropItem[] = [];

  // For Vue 3 components, try to access the component's __vccOpts which might contain props
  if (component.__vccOpts && component.__vccOpts.props) {
    const props = component.__vccOpts.props;
    extractedProps = Object.keys(props).map(propName => {
      const prop = props[propName];
      return {
        name: propName,
        type: getPropType(prop),
        required: prop.required ? 'true' : 'false',
        default: getPropDefault(prop),
      };
    });
  }
  // Check if component has a setup function (Vue 3 Composition API)
  else if (typeof component.setup === 'function') {
    // Try to extract props from component.props (might be available in some cases)
    if (component.props) {
      console.log('Component has props property:', component.props);
      extractedProps = Object.entries(component.props).map(([propName, prop]: [string, any]) => {
        return {
          name: propName,
          type: typeof prop.type === 'function' ? prop.type.name : 'Unknown',
          required: prop.required ? 'true' : 'false',
          default: prop.default !== undefined ? JSON.stringify(prop.default) : 'undefined',
        };
      });
    }
  } 
  // Check if component has props (Options API)
  else if (component.props) {
    const props = component.props;
    extractedProps = Object.keys(props).map(propName => {
      const prop = props[propName];
      return {
        name: propName,
        type: getPropType(prop),
        required: prop.required ? 'true' : 'false',
        default: getPropDefault(prop),
      };
    });
  }

  return extractedProps;
}

export function getPropsHeaders(additionalHeaders: Header[] = []): Header[] {
  return [
    { title: 'Name', key: 'name' },
    { title: 'Type', key: 'type' },
    { title: 'Required', key: 'required' },
    { title: 'Default', key: 'default' },
    { title: 'Actions', key: 'actions' },
    ...additionalHeaders
  ];
}

export function getEventHeaders(additionalHeaders: Header[] = []): Header[] {
  return [
    { title: 'Event', key: 'event' },
    { title: 'Payload', key: 'payload' },
    { title: 'Description', key: 'description' },
    ...additionalHeaders
  ];
}

//TODO: No longer working
// export function generateEventItems(definitions) {
//   return definitions.map(({ name, payload = 'None', description = 'No description provided' }) => ({
//     event: name,
//     payload,
//     description,
//   }));
// }

export function getSlotHeaders(additionalHeaders: Header[] = []): Header[] {
  return [
    { title: 'Name', key: 'name' },
    { title: 'Content', key: 'content' },
    { title: 'Description', key: 'description' },
    ...additionalHeaders
  ];
}
//TODO: No longer working
// export function generateSlotItems(definitions) {
//   return definitions.map(({ name, defaultContent = 'None', description = 'No description provided' }) => ({
//     name,
//     defaultContent,
//     description,
//   }));
// }

interface ComponentDocumentationOptions {
  component?: Component;
  propsAdditionalHeaders?: Header[];
  eventsAdditionalHeaders?: Header[];
  slotsAdditionalHeaders?: Header[];
}

export function generateComponentDocumentation(options: ComponentDocumentationOptions = {}) {
  const {
    component,
    // slotDefinitions = [],
    // eventDefinitions = [],
    propsAdditionalHeaders = [],
    eventsAdditionalHeaders = [],
    slotsAdditionalHeaders = []
  } = options;
  return {
    props: {
      headers: getPropsHeaders(propsAdditionalHeaders),
      items: component ? generatePropsItems(component) : []
    },
    events: {
      headers: getEventHeaders(eventsAdditionalHeaders),
      // items: generateEventItems(eventDefinitions)
    },
    slots: {
      headers: getSlotHeaders(slotsAdditionalHeaders),
      // items: generateSlotItems(slotDefinitions)
    }
  };
}
