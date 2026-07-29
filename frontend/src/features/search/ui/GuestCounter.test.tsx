import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { GuestCounter } from './SearchForm';

describe('GuestCounter', () => {
  it('calls onChange with value + 1 when the increase button is clicked', async () => {
    const onChange = vi.fn();
    render(<GuestCounter label="Adults" description="Age 18+" value={2} min={1} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Increase adults' }));

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('calls onChange with value - 1 when the decrease button is clicked', async () => {
    const onChange = vi.fn();
    render(<GuestCounter label="Adults" description="Age 18+" value={2} min={1} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Decrease adults' }));

    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('disables the decrease button once the value reaches the minimum', () => {
    render(<GuestCounter label="Adults" description="Age 18+" value={1} min={1} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Decrease adults' })).toBeDisabled();
  });
});
