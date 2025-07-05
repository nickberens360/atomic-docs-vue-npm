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

import * as ts from 'typescript';
import { parse, compileScript } from '@vue/compiler-sfc';

// Helper function to extract props from TypeScript interfaces in source content
function extractPropsFromTypeScript(sourceContent: string): PropItem[] {
  try {
    // Parse the Vue SFC
    const { descriptor } = parse(sourceContent);

    // If there's no script, return empty array
    if (!descriptor.script && !descriptor.scriptSetup) {
      return [];
    }

    // Compile the script to get the content
    const compiledScript = compileScript(descriptor, {
      id: 'temp-id',
      isProd: false,
      sourceMap: false
    });

    // Extract TypeScript interfaces from compiled script
    const scriptContent = compiledScript.content;

    // Create a TypeScript source file
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      scriptContent,
      ts.ScriptTarget.Latest,
      true
    );

    // Find all interfaces and type aliases in the source file
    const interfaces: Array<{
      name: string;
      properties: Array<{
        name: string;
        type: string;
        optional: boolean;
        defaultValue?: string;
      }>;
    }> = [];

    // Track type aliases for resolving references
    const typeAliases = new Map<string, ts.TypeNode>();

    // Track which interface/type is used for props
    let propsTypeName: string | null = null;

    // Visit all nodes in the source file to find interfaces and type aliases
    function visit(node: ts.Node) {
      // Look for interface declarations
      if (ts.isInterfaceDeclaration(node)) {
        const interfaceName = node.name.getText(sourceFile);
        const properties = node.members
          .filter(ts.isPropertySignature)
          .map(member => {
            const name = member.name.getText(sourceFile);
            const type = member.type ? member.type.getText(sourceFile) : 'any';
            const optional = !!member.questionToken;

            return {
              name,
              type,
              optional,
              // Default values aren't typically in interfaces
            };
          });

        interfaces.push({
          name: interfaceName,
          properties
        });
      }

      // Look for type aliases (type Props = {...})
      if (ts.isTypeAliasDeclaration(node)) {
        const typeName = node.name.getText(sourceFile);
        typeAliases.set(typeName, node.type);

        // If it's a type literal with properties, extract them
        if (ts.isTypeLiteralNode(node.type)) {
          const properties = node.type.members
            .filter(ts.isPropertySignature)
            .map(member => {
              const name = member.name.getText(sourceFile);
              const type = member.type ? member.type.getText(sourceFile) : 'any';
              const optional = !!member.questionToken;

              return {
                name,
                type,
                optional,
              };
            });

          interfaces.push({
            name: typeName,
            properties
          });
        }
      }

      // Look for defineProps calls with type arguments (Vue 3 Composition API)
      if (ts.isCallExpression(node) &&
          node.expression.getText(sourceFile) === 'defineProps') {

        // Check for type arguments (defineProps<Props>())
        if (node.typeArguments && node.typeArguments.length > 0) {
          propsTypeName = node.typeArguments[0].getText(sourceFile);
        }
        // Check for object literal arguments (defineProps({ prop: String }))
        else if (node.arguments.length > 0 && ts.isObjectLiteralExpression(node.arguments[0])) {
          // This is handled by the runtime props extraction, so we don't need to do anything here
        }
      }

      // Look for withDefaults(defineProps<Props>(), { ... })
      if (ts.isCallExpression(node) &&
          node.expression.getText(sourceFile) === 'withDefaults' &&
          node.arguments.length >= 1 &&
          ts.isCallExpression(node.arguments[0]) &&
          node.arguments[0].expression.getText(sourceFile) === 'defineProps' &&
          node.arguments[0].typeArguments &&
          node.arguments[0].typeArguments.length > 0) {

        propsTypeName = node.arguments[0].typeArguments[0].getText(sourceFile);

        // Extract default values if provided
        if (node.arguments.length >= 2 && ts.isObjectLiteralExpression(node.arguments[1])) {
          const defaultValues = new Map<string, string>();

          node.arguments[1].properties.forEach(prop => {
            if (ts.isPropertyAssignment(prop) &&
                (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name))) {
              const propName = ts.isIdentifier(prop.name) ? prop.name.text : prop.name.text;
              defaultValues.set(propName, prop.initializer.getText(sourceFile));
            }
          });

          // Find the interface and update default values
          if (propsTypeName) {
            const propsInterface = interfaces.find(i => i.name === propsTypeName);
            if (propsInterface) {
              propsInterface.properties.forEach(prop => {
                if (defaultValues.has(prop.name)) {
                  prop.defaultValue = defaultValues.get(prop.name);
                }
              });
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    // If we found a props type name from defineProps<T>(), use that
    let propsInterface = propsTypeName ?
      interfaces.find(i => i.name === propsTypeName) :
      // Otherwise look for common naming patterns
      interfaces.find(i =>
        i.name === 'Props' ||
        i.name === 'ComponentProps' ||
        i.name.endsWith('Props')
      );

    if (propsInterface) {
      return propsInterface.properties.map(prop => ({
        name: prop.name,
        type: prop.type,
        required: !prop.optional ? 'true' : 'false',
        default: prop.defaultValue || 'undefined'
      }));
    }

    // If we didn't find an interface but have a props type name that's a type alias
    // to something other than a type literal (e.g., a union or intersection type)
    if (propsTypeName && typeAliases.has(propsTypeName) && !propsInterface) {
      console.warn(`Found props type "${propsTypeName}" but it's not a simple interface or type literal.`);
      // This is a more complex case that would require additional type analysis
    }

    return [];
  } catch (error) {
    if (error instanceof Error) {
      console.warn(`Error extracting TypeScript interfaces: ${error.message}`);
    } else {
      console.warn(`An unknown error occurred while extracting TypeScript interfaces: ${String(error)}`);
    }
    return [];
  }
}

export function generatePropsItems(component: Component, sourceContent?: string): PropItem[] {
  try {
    if (!component) return [];

    // Try to extract props from various possible locations in the component object
    let extractedProps: PropItem[] = [];

    // If source content is provided, try to extract TypeScript interfaces
    if (sourceContent) {
      const interfaceProps = extractPropsFromTypeScript(sourceContent);
      if (interfaceProps.length > 0) {
        return interfaceProps;
      }
    }

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
  sourceContent?: string;
  propsAdditionalHeaders?: Header[];
  eventsAdditionalHeaders?: Header[];
  slotsAdditionalHeaders?: Header[];
}

export function generateComponentDocumentation(options: ComponentDocumentationOptions = {}) {
  const {
    component,
    sourceContent,
    // slotDefinitions = [],
    // eventDefinitions = [],
    propsAdditionalHeaders = [],
    eventsAdditionalHeaders = [],
    slotsAdditionalHeaders = []
  } = options;
  return {
    props: {
      headers: getPropsHeaders(propsAdditionalHeaders),
      items: component ? generatePropsItems(component, sourceContent) : []
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
