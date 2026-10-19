import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BinaryRain } from '../BinaryRain';

describe('BinaryRain Component', () => {
  it('renders canvas element without throwing in headless test environment', () => {
    const { container } = render(<BinaryRain />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
    expect(canvas).toHaveClass('pointer-events-none');
  });

  it('applies custom opacity and class names appropriately', () => {
    const { container } = render(
      <BinaryRain
        className="custom-rain-class"
        opacityClassName="opacity-40 dark:opacity-35"
      />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveClass('custom-rain-class');
    expect(canvas).toHaveClass('opacity-40');
  });
});
