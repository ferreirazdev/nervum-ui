import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppLogo } from './AppLogo';

describe('AppLogo', () => {
  it('renders an img with Nervum logo src and alt', () => {
    render(<AppLogo />);
    const img = screen.getByRole('img', { name: 'Nervum' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/logo.png');
    expect(img).toHaveAttribute('alt', 'Nervum');
  });

  it('applies default dimensions and base classes', () => {
    render(<AppLogo />);
    const img = screen.getByRole('img', { name: 'Nervum' });
    expect(img).toHaveAttribute('width', '875');
    expect(img).toHaveAttribute('height', '247');
    expect(img.className).toContain('block');
    expect(img.className).toContain('object-contain');
  });

  it('merges custom className with base classes', () => {
    render(<AppLogo className="custom-class" />);
    const img = screen.getByRole('img', { name: 'Nervum' });
    expect(img.className).toContain('custom-class');
  });
});
