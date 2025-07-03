// Define common table types that can be used across components
export interface Header {
  title: string;
  key: string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  width?: string | number;
}