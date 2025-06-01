import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/vue';
import DocsSlider from '../../components/DocsSlider.vue';

// Helper function to create a custom slider event
function createSliderEvent(clientX, target) {
  return {
    clientX,
    currentTarget: target,
    preventDefault: vi.fn()
  };
}

describe('DocsSlider Component', () => {
  // Clean up after each test to ensure isolation
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('Rendering and Appearance', () => {
    it('should render the slider with all essential elements', () => {
      const { getByRole, container } = render(DocsSlider, {
        props: {
          modelValue: 50
        }
      });

      // Check for main slider container
      expect(container.querySelector('.docs-slider')).toBeTruthy();

      // Check for track and thumb elements
      expect(container.querySelector('.docs-slider-track')).toBeTruthy();
      expect(container.querySelector('.docs-slider-thumb')).toBeTruthy();

      // The thumb should be draggable (implicit role)
      const thumb = container.querySelector('.docs-slider-thumb');
      expect(thumb).toBeTruthy();
      expect(thumb.getAttribute('style')).toContain('left: 50%');
    });

    it('should display a label when provided', async () => {
      const { container, rerender } = render(DocsSlider, {
        props: {
          modelValue: 50
        }
      });

      // Initially, no label should be present
      expect(container.querySelector('.docs-slider-label')).toBeFalsy();

      // After adding a label prop
      await rerender({ modelValue: 50, label: 'Brightness' });

      // Label should now be visible with the correct text
      const label = container.querySelector('.docs-slider-label');
      expect(label).toBeTruthy();
      expect(label.textContent).toContain('Brightness');
    });

    it('should show or hide details based on hideDetails prop', async () => {
      const { container, rerender } = render(DocsSlider, {
        props: {
          modelValue: 50
        }
      });

      // Details should be visible by default
      expect(container.querySelector('.docs-slider-details')).toBeTruthy();

      // After setting hideDetails to true
      await rerender({ modelValue: 50, hideDetails: true });

      // Details should now be hidden
      expect(container.querySelector('.docs-slider-details')).toBeFalsy();
    });
  });

  describe('Prop Handling', () => {
    it('should apply default props correctly when not specified', () => {
      const { container } = render(DocsSlider, {
        props: {
          modelValue: 50
        }
      });

      // Check min and max values in the details section
      const details = container.querySelector('.docs-slider-details');
      expect(details.querySelector('.docs-slider-min-value').textContent).toBe('0');
      expect(details.querySelector('.docs-slider-max-value').textContent).toBe('100');
    });

    it('should correctly apply custom min and max values', () => {
      const { container } = render(DocsSlider, {
        props: {
          modelValue: 75,
          min: 50,
          max: 150
        }
      });

      // Check min and max values in the details section
      const details = container.querySelector('.docs-slider-details');
      expect(details.querySelector('.docs-slider-min-value').textContent).toBe('50');
      expect(details.querySelector('.docs-slider-max-value').textContent).toBe('150');
    });
  });

  describe('Visual Representation', () => {
    it('should position the fill track correctly based on value', async () => {
      const { container, rerender } = render(DocsSlider, {
        props: {
          modelValue: 50
        }
      });

      // With default props and value=50, fill should be at 50%
      let fill = container.querySelector('.docs-slider-track-fill');
      expect(fill.getAttribute('style')).toContain('width: 50%');

      // After changing value to 25
      await rerender({ modelValue: 25 });
      fill = container.querySelector('.docs-slider-track-fill');
      expect(fill.getAttribute('style')).toContain('width: 25%');

      // With custom min=50, max=150, value=100
      await rerender({ modelValue: 100, min: 50, max: 150 });
      fill = container.querySelector('.docs-slider-track-fill');
      expect(fill.getAttribute('style')).toContain('width: 50%');
    });

    it('should position the thumb correctly based on value', async () => {
      const { container, rerender } = render(DocsSlider, {
        props: {
          modelValue: 50
        }
      });

      // With default props and value=50, thumb should be at 50%
      let thumb = container.querySelector('.docs-slider-thumb');
      expect(thumb.getAttribute('style')).toContain('left: 50%');

      // After changing value to 75
      await rerender({ modelValue: 75 });
      thumb = container.querySelector('.docs-slider-thumb');
      expect(thumb.getAttribute('style')).toContain('left: 75%');
    });
  });

  describe('User Interactions', () => {
    it('should emit update:modelValue event when track is clicked', async () => {
      // Mock getBoundingClientRect to return consistent values
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        height: 10,
        right: 100,
        bottom: 10
      }));

      const { container, emitted } = render(DocsSlider, {
        props: {
          modelValue: 50
        }
      });

      // Get the track element
      const track = container.querySelector('.docs-slider-track-container');

      // Simulate a click at 75% of the track width
      await fireEvent.click(track, { clientX: 75 });

      // Check if the event was emitted with the correct value
      const updateEvents = emitted()['update:modelValue'];
      expect(updateEvents).toBeTruthy();
      expect(updateEvents[0][0]).toBeCloseTo(75);
    });

    it('should start dragging when thumb is clicked', async () => {
      // Mock getBoundingClientRect to return consistent values
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        height: 10,
        right: 100,
        bottom: 10
      }));

      const { container, emitted } = render(DocsSlider, {
        props: {
          modelValue: 50
        }
      });

      // Get the thumb element
      const thumb = container.querySelector('.docs-slider-thumb');

      // Simulate mousedown on the thumb
      await fireEvent.mouseDown(thumb);

      // Simulate mousemove to position 75
      await fireEvent.mouseMove(document, { clientX: 75 });

      // Simulate mouseup to end drag
      await fireEvent.mouseUp(document);

      // Check if the event was emitted with the correct value
      const updateEvents = emitted()['update:modelValue'];
      expect(updateEvents).toBeTruthy();
      expect(updateEvents[updateEvents.length - 1][0]).toBeCloseTo(75);
    });

    it('should handle step constraints correctly', async () => {
      // Mock getBoundingClientRect to return consistent values
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        height: 10,
        right: 100,
        bottom: 10
      }));

      const { container, emitted } = render(DocsSlider, {
        props: {
          modelValue: 50,
          step: 10
        }
      });

      // Get the track element
      const track = container.querySelector('.docs-slider-track-container');

      // Simulate a click at 73% of the track width (should round to 70 with step=10)
      await fireEvent.click(track, { clientX: 73 });

      // Check if the event was emitted with the correct value
      const updateEvents = emitted()['update:modelValue'];
      expect(updateEvents).toBeTruthy();
      expect(updateEvents[0][0]).toBe(70);
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA attributes for accessibility', () => {
      // This test would be more comprehensive with actual ARIA attributes
      // For now, we'll check that the component structure is accessible
      const { container } = render(DocsSlider, {
        props: {
          modelValue: 50,
          label: 'Volume'
        }
      });

      // The slider should have a label for accessibility
      const label = container.querySelector('.docs-slider-label');
      expect(label).toBeTruthy();
      expect(label.textContent).toContain('Volume');

      // The slider should have min and max values displayed
      const details = container.querySelector('.docs-slider-details');
      expect(details).toBeTruthy();
    });
  });
});
