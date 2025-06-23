<template>
  <div class="atomic-docs-data-table text-body-4">
    <table class="atomic-docs-table">
      <thead>
        <tr>
          <th
            v-for="header in headers"
            :key="header.key"
            :class="header.align ? `text-${header.align}` : ''"
          >
            {{ header.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in items"
          :key="index"
        >
          <td
            v-for="header in headers"
            :key="`${index}-${header.key}`"
            :class="header.align ? `text-${header.align}` : ''"
          >
            <slot
              :name="`item.${header.key}`"
              :value="item[header.key]"
              :item="item"
              :index="index"
              :headers="headers"
            >
              {{ item[header.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
      <tfoot v-if="!hideDefaultFooter && $slots.footer">
        <tr>
          <td :colspan="headers.length">
            <slot name="footer" />
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Header {
  title: string;
  key: string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  width?: string | number;
}

interface Props {
  headers: Header[];
  items: any[];
  hideDefaultFooter?: boolean;
  mobileBreakpoint?: string;
}

const props = withDefaults(defineProps<Props>(), {
  hideDefaultFooter: false,
  mobileBreakpoint: 'sm'
});
</script>

<style lang="scss" scoped>
.atomic-docs-data-table {
  width: 100%;
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  overflow: hidden;
  box-shadow: var(--atomic-docs-shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.1));
}

.atomic-docs-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--atomic-docs-background-color, white);
  margin-bottom: 0;

  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.12));
  }

  td{
    font-size: var(--atomic-docs-font-size-sm, 14px) !important;
  }

  th {
    font-weight: 500;
    color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
    white-space: nowrap;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .text-start {
    text-align: left;
  }

  .text-center {
    text-align: center;
  }

  .text-end {
    text-align: right;
  }
}

@media (max-width: 600px) {
  .atomic-docs-table {
    th, td {
      padding: 8px 12px;
    }
  }
}
</style>
