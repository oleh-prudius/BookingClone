import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('shows the app version and current year', () => {
    render(<Footer />, { wrapper: MemoryRouter });
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`Triply v.+${year}`))).toBeInTheDocument();
  });
});
