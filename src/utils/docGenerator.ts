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

export interface PropItem {
  name: string;
  type: string;
  required: string;
  default: string;
}

export interface Header {
  title: string;
  key: string;
}

export function getPropType(prop: Prop): string {
  try {
    if (Array.isArray(prop.type)) {
      return prop.type.map(t => t.name).join(' | ');
    }
    return prop.type ? prop.type.name : 'Type Undefined';
  } catch (error) {
    if (error instanceof Error) {
      console.warn(`Could not determine prop type: ${error.message}`);
    } else {
      console.warn(`An unknown error occurred while determining prop type: ${String(error)}`);
    }
    return 'Unknown';
  }
}

export function getPropDefault(prop: Prop): string {
  try {
    if (prop.default === undefined) {
      return 'undefined';
    }
    if (typeof prop.default === 'function') {
      const defaultValue = prop.default();
      return JSON.stringify(defaultValue);
    }
    return JSON.stringify(prop.default);
  } catch (error) {
    if (error instanceof Error) {
      console.warn(`Could not determine prop default value: ${error.message}`);
    } else {
      console.warn(`An unknown error occurred while determining prop default value: ${String(error)}`);
    }
    return 'undefined';
  }
}

export function generatePropsItems(component: Component): PropItem[] {
  try {
    if (!component) return [];

    // Try to extract props from various possible locations in the component object
    let extractedProps: PropItem[] = [];

    try {
      // For Vue 3 components, try to access the component's __vccOpts which might contain props
      if (component.__vccOpts && component.__vccOpts.props) {
        const props = component.__vccOpts.props;
        extractedProps = Object.keys(props).map(propName => {
          try {
            const prop = props[propName];
            return {
              name: propName,
              type: getPropType(prop),
              required: prop.required ? 'true' : 'false',
              default: getPropDefault(prop),
            };
          } catch (error) {
            if (error instanceof Error) {
              console.warn(`Could not process prop ${propName}: ${error.message}`);
            } else {
              console.warn(`An unknown error occurred while processing prop ${propName}: ${String(error)}`);
            }
            return {
              name: propName,
              type: 'Unknown',
              required: 'false',
              default: 'undefined',
            };
          }
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error accessing __vccOpts props: ${error.message}`);
      } else {
        console.warn(`An unknown error occurred while accessing __vccOpts props: ${String(error)}`);
      }
    }

    // If no props extracted yet, try other methods
    if (extractedProps.length === 0) {
      try {
        // Check if component has a setup function (Vue 3 Composition API)
        if (typeof component.setup === 'function') {
          // Try to extract props from component.props (might be available in some cases)
          if (component.props) {
            extractedProps = Object.entries(component.props).map(([propName, prop]: [string, any]) => {
              try {
                return {
                  name: propName,
                  type: typeof prop.type === 'function' ? prop.type.name : 'Unknown',
                  required: prop.required ? 'true' : 'false',
                  default: prop.default !== undefined ? JSON.stringify(prop.default) : 'undefined',
                };
              } catch (error) {
                if (error instanceof Error) {
                  console.warn(`Could not process prop ${propName} from setup component: ${error.message}`);
                } else {
                  console.warn(`An unknown error occurred while processing prop ${propName} from setup component: ${String(error)}`);
                }
                return {
                  name: propName,
                  type: 'Unknown',
                  required: 'false',
                  default: 'undefined',
                };
              }
            });
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          console.warn(`Error processing component with setup function: ${error.message}`);
        } else {
          console.warn(`An unknown error occurred while processing component with setup function: ${String(error)}`);
        }
      }
    }

    // If still no props extracted, try Options API approach
    if (extractedProps.length === 0) {
      try {
        // Check if component has props (Options API)
        if (component.props) {
          const props = component.props;
          extractedProps = Object.keys(props).map(propName => {
            try {
              const prop = props[propName];
              return {
                name: propName,
                type: getPropType(prop),
                required: prop.required ? 'true' : 'false',
                default: getPropDefault(prop),
              };
            } catch (error) {
              if (error instanceof Error) {
                console.warn(`Could not process prop ${propName} from options API: ${error.message}`);
              } else {
                console.warn(`An unknown error occurred while processing prop ${propName} from options API: ${String(error)}`);
              }
              return {
                name: propName,
                type: 'Unknown',
                required: 'false',
                default: 'undefined',
              };
            }
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          console.warn(`Error processing component with options API props: ${error.message}`);
        } else {
          console.warn(`An unknown error occurred while processing component with options API props: ${String(error)}`);
        }
      }
    }

    return extractedProps;
  } catch (error) {
    if (error instanceof Error) {
      console.warn(`Could not analyze component props: ${error.message}`);
    } else {
      console.warn(`An unknown error occurred while analyzing component props: ${String(error)}`);
    }
    return [];
  }
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