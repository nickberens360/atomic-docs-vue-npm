import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/vue';
import DocsTextField from '../../src/components/DocsTextField.vue';

describe('DocsTextField', () => {
  it('renders properly with default props', () => {
    const { getByRole } = render(DocsTextField);
    const input = getByRole('textbox');
    expect(input).toBeDefined();
  });

  it('renders with placeholder text', () => {
    const placeholder = 'Enter text here';
    const { getByPlaceholderText } = render(DocsTextField, {
      props: { placeholder }
    });
    const input = getByPlaceholderText(placeholder);
    expect(input).toBeDefined();
  });

  it('emits update:modelValue event when input value changes', async () => {
    const { getByRole, emitted } = render(DocsTextField);
    const input = getByRole('textbox');

    await fireEvent.update(input, 'New Value');

    expect(emitted()).toHaveProperty('update:modelValue');
    expect(emitted()['update:modelValue'][0]).toEqual(['New Value']);
  });

  it('displays prepend icon when prependInnerIcon prop is provided', () => {
    const { container } = render(DocsTextField, {
      props: { prependInnerIcon: 'mdi-magnify' }
    });

    const prependIcon = container.querySelector('.atomic-docs-prepend-icon');
    expect(prependIcon).toBeDefined();
    expect(prependIcon?.textContent?.trim()).toBe('🔍');
  });

  it('applies solo variant class when variant is set to solo', () => {
    const { container } = render(DocsTextField, {
      props: { variant: 'solo' }
    });

    const textField = container.querySelector('.atomic-docs-text-field');
    expect(textField?.classList.contains('atomic-docs-text-field--solo')).toBe(true);
  });

  it('sets background color based on bgColor prop', () => {
    const { container } = render(DocsTextField, {
      props: { bgColor: 'surface' }
    });

    const textField = container.querySelector('.atomic-docs-text-field');
    expect(textField?.getAttribute('style')).toContain('background-color: var(--atomic-docs-surface-color)');
  });

  it('hides details section when hideDetails is true', () => {
    const { container } = render(DocsTextField, {
      props: { hideDetails: true }
    });

    const details = container.querySelector('.atomic-docs-details');
    expect(details).toBeNull();
  });

  it('renders details slot content when provided', () => {
    const { container } = render(DocsTextField, {
      slots: {
        details: '<span data-testid="details-content">Helper text</span>'
      }
    });

    const details = container.querySelector('.atomic-docs-details');
    expect(details).toBeDefined();
    expect(details?.innerHTML).toContain('Helper text');
  });

  it('renders append-inner slot content when provided', () => {
    const { container } = render(DocsTextField, {
      slots: {
        'append-inner': '<span data-testid="append-content">✓</span>'
      }
    });

    const appendIcon = container.querySelector('.atomic-docs-append-icon');
    expect(appendIcon).toBeDefined();
    expect(appendIcon?.innerHTML).toContain('✓');
  });
});