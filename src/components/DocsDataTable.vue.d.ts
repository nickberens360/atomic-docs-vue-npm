declare module './DocsDataTable.vue' {
  import { DefineComponent } from 'vue';
  import { Header } from './tableTypes';

  const component: DefineComponent<{
    headers: Header[];
    items: any[];
    hideDefaultFooter?: boolean;
    mobileBreakpoint?: string;
  }>;

  export default component;
}
