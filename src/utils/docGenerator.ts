// src/utils/docGenerator.ts

interface PropType {
  name: string;
}

interface Prop {
  type: PropType | PropType[];
  required?: boolean;
  default?: any;
  name?: string; // Add name to the prop interface for easier access
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

/**
 * Extracts the default values from a withDefaults call in a script.
 * @param scriptContent - The raw content of the <script> block.
 * @returns A record mapping prop names to their default values.
 */
function extractWithDefaults(scriptContent: string): Record<string, any> {
  // Regex to find withDefaults and capture the defaults object
  const defaultsRegex = /withDefaults\s*\(\s*defineProps<[^>]+>\(\)\s*,\s*({[\s\S]*?})\s*\)/;
  const match = scriptContent.match(defaultsRegex);

  if (match && match[1]) {
    try {
      // The captured group is the defaults object string.
      // We can use a Function constructor to safely parse this object.
      // This is safer than eval() and works well for object literals.
      const defaultsObjectString = match[1];
      const func = new Function(`return ${defaultsObjectString}`);
      return func();
    } catch (e) {
      console.error("Could not parse withDefaults object from script:", e);
      return {};
    }
  }
  return {};
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

export function getPropDefault(prop: Prop, extractedDefaults: Record<string, any> = {}): string {
  // Prioritize the default value extracted from withDefaults
  if (prop.name && extractedDefaults[prop.name] !== undefined) {
    return JSON.stringify(extractedDefaults[prop.name]);
  }

  // Fallback to existing logic if not found in withDefaults
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

export function generatePropsItems(component: Component, scriptContent: string = ''): PropItem[] {
  try {
    if (!component) return [];

    // Extract defaults from the script content first
    const extractedDefaults = scriptContent ? extractWithDefaults(scriptContent) : {};

    let propsDefinition: Props | undefined;

    // Consolidate where to find the props definition
    if (component.__vccOpts && component.__vccOpts.props) {
      propsDefinition = component.__vccOpts.props;
    } else if (component.props) {
      propsDefinition = component.props;
    }

    if (propsDefinition) {
      return Object.keys(propsDefinition).map(propName => {
        const prop = propsDefinition![propName];
        return {
          name: propName,
          type: getPropType(prop),
          required: prop.required ? 'true' : 'false',
          // Pass the extracted defaults to getPropDefault
          default: getPropDefault({ ...prop, name: propName }, extractedDefaults),
        };
      });
    }

    return [];
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

export function getSlotHeaders(additionalHeaders: Header[] = []): Header[] {
  return [
    { title: 'Name', key: 'name' },
    { title: 'Content', key: 'content' },
    { title: 'Description', key: 'description' },
    ...additionalHeaders
  ];
}

interface ComponentDocumentationOptions {
  component?: Component;
  propsAdditionalHeaders?: Header[];
  eventsAdditionalHeaders?: Header[];
  slotsAdditionalHeaders?: Header[];
}

export function generateComponentDocumentation(options: ComponentDocumentationOptions = {}) {
  const {
    component,
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
    },
    slots: {
      headers: getSlotHeaders(slotsAdditionalHeaders),
    }
  };
}