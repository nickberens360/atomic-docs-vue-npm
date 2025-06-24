<template>
  <div>
    <div
      class="atomic-docs-search-container"
    >
      <div
        class="atomic-docs-text-field"
        :class="{
          'atomic-docs-text-field--flat': props.flat,
          'atomic-docs-text-field--outlined': props.inputVariant === 'outlined',
          'atomic-docs-text-field--filled': props.inputVariant === 'filled',
          'atomic-docs-text-field--solo': props.inputVariant === 'solo',
          'atomic-docs-text-field--underlined': props.inputVariant === 'underlined',
          'atomic-docs-text-field--plain': props.inputVariant === 'plain'
        }"
        :style="{ backgroundColor: mappedInputBgColor }"
      >
        <div
          class="atomic-docs-input-wrapper"
          :class="`atomic-docs-input-wrapper--${props.inputSize}`"
        >
          <span class="atomic-docs-prepend-icon">🔍</span>
          <input
            v-model="filterText"
            name="filter-list"
            placeholder="Search Components"
            class="atomic-docs-input"
            autocomplete="one-time-code"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          >
          <span
            v-if="filterText"
            class="atomic-docs-append-icon"
            @click="filterText = ''"
          >
                ✕
              </span>
        </div>
      </div>

      <div class="atomic-docs-menu-container">
        <div
          v-show="isMenuOpen"
          class="atomic-docs-menu"
          :class="{
            'no-background': props.backgroundColor === false,
            'atomic-docs-menu--flat': props.flat
          }"
          :style="props.backgroundColor !== false ? { backgroundColor: mappedBackgroundColor } : {}"
        >
          <DocsComponentNavigation
            :filter-text="filterText"
            :on-nav-click="handleNavClick"
            bg-color="surface"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from "vue-router";
import DocsComponentNavigation from "@/components/DocsComponentNavigation.vue";
import { ComponentItem } from '../types';

// Define props
interface Props {
  persistOpen?: boolean;
  backgroundColor?: 'background' | 'surface' | 'surface-dark' | false;
  flat?: boolean;
  inputVariant?: 'outlined' | 'filled' | 'solo' | 'underlined' | 'plain';
  inputBgColor?: 'background' | 'surface' | 'surface-dark' | false;
  closeOnClick?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  persistOpen: false,
  backgroundColor: 'background',
  flat: false,
  inputVariant: 'filled',
  inputBgColor: 'background',
  closeOnClick: false,
  inputSize: 'md'
});

// Computed properties to map color values to CSS variables
const mappedBackgroundColor = computed(() => {
  if (props.backgroundColor === false) return false;
  if (props.backgroundColor === 'background') return 'var(--atomic-docs-background-color)';
  if (props.backgroundColor === 'surface') return 'var(--atomic-docs-surface-color)';
  if (props.backgroundColor === 'surface-dark') return 'var(--atomic-docs-surface-color-dark)';
  return props.backgroundColor;
});

const mappedInputBgColor = computed(() => {
  if (props.inputBgColor === false) return 'transparent';
  if (props.inputBgColor === 'background') return 'var(--atomic-docs-background-color)';
  if (props.inputBgColor === 'surface') return 'var(--atomic-docs-surface-color)';
  if (props.inputBgColor === 'surface-dark') return 'var(--atomic-docs-surface-color-dark)';
  return props.inputBgColor;
});

const router = useRouter();
const filterText = ref('');
const isMenuOpen = ref(props.persistOpen);

function handleNavClick(arg: ComponentItem): void {
  router.push({
    name: 'componentDoc' as any,
    params: { componentName: arg.exampleComponent },
    query: { relativePath: arg.relativePath }
  });
  // Only close the menu if persistOpen is false AND closeOnClick is true
  if (!props.persistOpen && props.closeOnClick) {
    isMenuOpen.value = false;
  }
}

// Handle input focus and blur events
const handleInputFocus = () => {
  isMenuOpen.value = true;
};

const handleInputBlur = () => {
  // Only close the menu if persistOpen is false AND closeOnClick is true
  if (!props.persistOpen && props.closeOnClick) {
    // Small delay to allow for clicking on menu items
    setTimeout(() => {
      isMenuOpen.value = false;
    }, 200);
  }
};
</script>

<style scoped lang="scss">
.atomic-docs-search-container {
  position: relative;
  //margin-right: 16px;
}

.atomic-docs-text-field {
  width: 300px;
  background-color: var(--atomic-docs-surface-color, white);
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  box-shadow: var(--atomic-docs-shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.1));

  &--flat {
    box-shadow: none;
  }

  &--outlined {
    background-color: transparent;
    box-shadow: none;

    .atomic-docs-input-wrapper {
      border: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.23));
    }
  }

  &--filled {
    background-color: var(--atomic-docs-background-color, #f5f5f5);
    box-shadow: none;

    .atomic-docs-input-wrapper {
      border: none;
    }
  }

  &--solo {
    background-color: var(--atomic-docs-surface-color, white);
    box-shadow: var(--atomic-docs-shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.1));

    .atomic-docs-input-wrapper {
      border: none;
    }
  }

  &--underlined {
    background-color: transparent;
    box-shadow: none;
    border-radius: 0;

    .atomic-docs-input-wrapper {
      border: none;
      border-bottom: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.23));
      border-radius: 0;
    }
  }

  &--plain {
    background-color: transparent;
    box-shadow: none;

    .atomic-docs-input-wrapper {
      border: none;
    }
  }
}

.atomic-docs-input-wrapper {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.23));
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  transition: border-color 0.2s;

  &:focus-within {
    border-color: var(--atomic-docs-primary-color, #1976d2);
  }

  // Size variants
  &--sm {
    height: 32px;
    padding: 4px 8px;
  }

  &--md {
    height: 40px; // Default size as specified
    padding: 8px 12px;
  }

  &--lg {
    height: 48px;
    padding: 12px 16px;
  }
}

.atomic-docs-prepend-icon, .atomic-docs-append-icon {
  font-size: var(--atomic-docs-font-size-md, 18px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.54));
}

.atomic-docs-append-icon {
  cursor: pointer;
}

.atomic-docs-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0 8px;
  font-size: 14px;
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
  background-color: transparent;
}

.atomic-docs-menu-container {
  position: relative;
}

.atomic-docs-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 300px;
  max-height: 80vh; /* Limit height to 80% of viewport height */
  overflow-y: auto; /* Enable vertical scrolling */
  background-color: var(--atomic-docs-surface-color, white);
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  box-shadow: var(--atomic-docs-shadow-md, 0 4px 8px rgba(0, 0, 0, 0.1));
  z-index: 100;
  margin-top: 4px;

  &.no-background {
    background-color: transparent;
  }

  &--flat {
    box-shadow: none;
  }
}
</style>
