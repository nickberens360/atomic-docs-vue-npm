import { describe, it, expect, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/vue';
import DocsTextField from '../../components/DocsTextField.vue';

describe('DocsTextField Component', () => {
  // Clean up after each test to ensure isolation
  afterEach(() => {
    cleanup();
  });

  describe('Rendering and Appearance', () => {
    it('should render the text field with all essential elements', () => {
      const { container } = render(DocsTextField, {
        props: {
          modelValue: 'Test Value'
        }
      });

      // Check for main container
      expect(container.querySelector('.docs-text-field')).toBeTruthy();

      // Check for input wrapper and input element
      expect(container.querySelector('.docs-input-wrapper')).toBeTruthy();
      expect(container.querySelector('.docs-input')).toBeTruthy();

      // Check that input has the correct value
      expect(container.querySelector('.docs-input').value).toBe('Test Value');
    });

    it('should apply solo variant class when specified', () => {
      const { container } = render(DocsTextField, {
        props: {
          modelValue: 'Test Value',
          variant: 'solo'
        }
      });

      // Check that the solo variant class is applied
      expect(container.querySelector('.docs-text-field--solo')).toBeTruthy();
    });

    it('should show prepend icon when provided', () => {
      const { container } = render(DocsTextField, {
        props: {
          modelValue: 'Test Value',
          prependInnerIcon: 'mdi-magnify'
        }
      });

      // Check that the prepend icon is shown
      const prependIcon = container.querySelector('.docs-prepend-icon');
      expect(prependIcon).toBeTruthy();
      expect(prependIcon.textContent.trim()).toBe('🔍');
    });

    it('should show/hide details section based on hideDetails prop', async () => {
      const { container, rerender } = render(DocsTextField, {
        props: {
          modelValue: 'Test Value'
        },
        slots: {
          details: 'Helper text'
        }
      });

      // Details should be visible by default
      expect(container.querySelector('.docs-details')).toBeTruthy();

      // After setting hideDetails to true
      await rerender({ 
        modelValue: 'Test Value',
        hideDetails: true
      });

      // Details should now be hidden
      expect(container.querySelector('.docs-details')).toBeFalsy();
    });
  });

  describe('Prop Handling', () => {
    it('should apply placeholder correctly', () => {
      const { container } = render(DocsTextField, {
        props: {
          placeholder: 'Enter text here'
        }
      });

      // Check that the placeholder is applied
      expect(container.querySelector('.docs-input').placeholder).toBe('Enter text here');
    });

    it('should apply name attribute correctly', () => {
      const { container } = render(DocsTextField, {
        props: {
          name: 'username'
        }
      });

      // Check that the name attribute is applied
      expect(container.querySelector('.docs-input').name).toBe('username');
    });

    it('should apply autocomplete attribute correctly', () => {
      const { container } = render(DocsTextField, {
        props: {
          autocomplete: 'off'
        }
      });

      // Check that the autocomplete attribute is applied
      expect(container.querySelector('.docs-input').autocomplete).toBe('off');
    });
  });

  describe('User Interactions', () => {
    it('should emit update:modelValue event when input value changes', async () => {
      const { container, emitted } = render(DocsTextField, {
        props: {
          modelValue: ''
        }
      });

      // Get the input element
      const input = container.querySelector('.docs-input');

      // Simulate typing in the input
      await fireEvent.update(input, 'New Value');

      // Check if the event was emitted with the correct value
      const updateEvents = emitted()['update:modelValue'];
      expect(updateEvents).toBeTruthy();
      expect(updateEvents[0][0]).toBe('New Value');
    });
  });

  describe('Slots', () => {
    it('should render content in prepend-inner slot', () => {
      const { container } = render(DocsTextField, {
        props: {
          modelValue: '',
          prependInnerIcon: 'icon' // Need to set this prop to make the prepend icon container visible
        },
        slots: {
          'prepend-inner': '<span data-testid="custom-prepend">Custom Prepend</span>'
        }
      });

      // Check that the slot content is rendered
      const prependIcon = container.querySelector('.docs-prepend-icon');
      expect(prependIcon).toBeTruthy();
      expect(prependIcon.innerHTML).toContain('Custom Prepend');
    });

    it('should render content in append-inner slot', () => {
      const { container } = render(DocsTextField, {
        props: {
          modelValue: ''
        },
        slots: {
          'append-inner': '<span data-testid="custom-append">Custom Append</span>'
        }
      });

      // Check that the slot content is rendered
      const appendIcon = container.querySelector('.docs-append-icon');
      expect(appendIcon).toBeTruthy();
      expect(appendIcon.innerHTML).toContain('Custom Append');
    });

    it('should render content in details slot', () => {
      const { container } = render(DocsTextField, {
        props: {
          modelValue: ''
        },
        slots: {
          details: '<span data-testid="custom-details">Helper Text</span>'
        }
      });

      // Check that the slot content is rendered
      const details = container.querySelector('.docs-details');
      expect(details).toBeTruthy();
      expect(details.innerHTML).toContain('Helper Text');
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate attributes for accessibility', () => {
      const { container } = render(DocsTextField, {
        props: {
          modelValue: '',
          name: 'username',
          placeholder: 'Enter username'
        }
      });

      // Check that the input has appropriate attributes for accessibility
      const input = container.querySelector('.docs-input');
      expect(input.name).toBe('username');
      expect(input.placeholder).toBe('Enter username');
    });
  });
});
