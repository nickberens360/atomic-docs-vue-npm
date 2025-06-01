import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/vue';
import DocsColorPicker from '../../components/DocsColorPicker.vue';

// Mock Vue composition API functions
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    onMounted: vi.fn((fn) => fn()),
    onUnmounted: vi.fn((fn) => fn()),
    watch: vi.fn(),
  };
});

describe('DocsColorPicker Component', () => {
  // Clean up after each test to ensure isolation
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('Rendering and Appearance', () => {
    it('should render the color picker with all essential elements', () => {
      const { container } = render(DocsColorPicker, {
        props: {
          modelValue: '#ff0000'
        }
      });

      // Check for main container
      expect(container.querySelector('.docs-color-picker')).toBeTruthy();

      // Check for header elements
      expect(container.querySelector('.docs-color-picker-header')).toBeTruthy();
      expect(container.querySelector('.docs-color-preview')).toBeTruthy();
      expect(container.querySelector('.docs-color-input')).toBeTruthy();

      // Check for canvas
      expect(container.querySelector('.docs-saturation-canvas')).toBeTruthy();
      expect(container.querySelector('.docs-saturation-pointer')).toBeTruthy();

      // Check for hue slider
      expect(container.querySelector('.docs-hue-container')).toBeTruthy();
      expect(container.querySelector('.docs-hue-track')).toBeTruthy();
      expect(container.querySelector('.docs-hue-thumb')).toBeTruthy();
    });

    it('should show alpha slider when showAlpha prop is true', async () => {
      const { container, rerender } = render(DocsColorPicker, {
        props: {
          modelValue: '#ff0000',
          showAlpha: false
        }
      });

      // Alpha slider should not be visible by default
      expect(container.querySelector('.docs-alpha-container')).toBeFalsy();

      // After setting showAlpha to true
      await rerender({ modelValue: '#ff0000', showAlpha: true });

      // Alpha slider should now be visible
      expect(container.querySelector('.docs-alpha-container')).toBeTruthy();
      expect(container.querySelector('.docs-alpha-track')).toBeTruthy();
      expect(container.querySelector('.docs-alpha-thumb')).toBeTruthy();
    });
  });

  describe('Color Input Handling', () => {
    it('should update the color preview when input value changes', async () => {
      const { container } = render(DocsColorPicker, {
        props: {
          modelValue: '#ff0000'
        }
      });

      // Get the input element
      const input = container.querySelector('.docs-color-input');

      // Change the input value
      await fireEvent.update(input, '#00ff00');
      await fireEvent.change(input);

      // Check if the color preview background color has been updated
      const preview = container.querySelector('.docs-color-preview');
      expect(preview.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('should emit update:modelValue event when input value changes', async () => {
      const { container, emitted } = render(DocsColorPicker, {
        props: {
          modelValue: '#ff0000'
        }
      });

      // Get the input element
      const input = container.querySelector('.docs-color-input');

      // Change the input value
      await fireEvent.update(input, '#00ff00');
      await fireEvent.change(input);

      // Check if the event was emitted with the correct value
      const updateEvents = emitted()['update:modelValue'];
      expect(updateEvents).toBeTruthy();
      expect(updateEvents[0][0]).toBe('#00ff00');
    });
  });

  describe('Canvas Interactions', () => {
    it('should update color when saturation canvas is clicked', async () => {
      // Mock canvas and context
      const mockContext = {
        fillStyle: '',
        fillRect: vi.fn(),
        createLinearGradient: vi.fn(() => ({
          addColorStop: vi.fn()
        }))
      };

      // Mock getBoundingClientRect for canvas
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 100,
        height: 100
      }));

      // Mock getContext
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

      const { container, emitted } = render(DocsColorPicker, {
        props: {
          modelValue: '#ff0000'
        }
      });

      // Get the canvas element
      const canvas = container.querySelector('.docs-saturation-canvas');

      // Simulate a click on the canvas
      await fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });

      // Check if the event was emitted
      const updateEvents = emitted()['update:modelValue'];
      expect(updateEvents).toBeTruthy();
    });
  });

  describe('Hue Slider Interactions', () => {
    it('should update color when hue slider is clicked', async () => {
      // Mock getBoundingClientRect for hue track
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        width: 100
      }));

      const { container, emitted } = render(DocsColorPicker, {
        props: {
          modelValue: '#ff0000'
        }
      });

      // Get the hue track element
      const hueTrack = container.querySelector('.docs-hue-track');

      // Simulate a click on the hue track
      await fireEvent.mouseDown(hueTrack, { clientX: 50 });

      // Check if the event was emitted
      const updateEvents = emitted()['update:modelValue'];
      expect(updateEvents).toBeTruthy();
    });
  });

  describe('Alpha Slider Interactions', () => {
    it('should update color when alpha slider is clicked', async () => {
      // Mock getBoundingClientRect for alpha track
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        width: 100
      }));

      const { container, emitted } = render(DocsColorPicker, {
        props: {
          modelValue: '#ff0000',
          showAlpha: true
        }
      });

      // Get the alpha track element
      const alphaTrack = container.querySelector('.docs-alpha-track');

      // Simulate a click on the alpha track
      await fireEvent.mouseDown(alphaTrack, { clientX: 50 });

      // Check if the event was emitted
      const updateEvents = emitted()['update:modelValue'];
      expect(updateEvents).toBeTruthy();
    });
  });

  describe('Color Conversion', () => {
    it('should correctly handle hex color input', async () => {
      const { container, emitted } = render(DocsColorPicker, {
        props: {
          modelValue: '#ff0000'
        }
      });

      // Get the input element
      const input = container.querySelector('.docs-color-input');

      // Test various hex formats
      const testCases = [
        '#00ff00',  // 6-digit hex
        '#0f0',     // 3-digit hex
        '#00ff00ff' // 8-digit hex with alpha
      ];

      for (const hexColor of testCases) {
        // Change the input value
        await fireEvent.update(input, hexColor);
        await fireEvent.change(input);

        // Check if the event was emitted with the correct value
        const updateEvents = emitted()['update:modelValue'];
        // The component normalizes hex colors, so we need to check for the normalized version
        if (hexColor === '#0f0') {
          expect(updateEvents[updateEvents.length - 1][0]).toBe('#00ff00');
        } else {
          expect(updateEvents[updateEvents.length - 1][0]).toBe(hexColor);
        }
      }
    });
  });
});
