import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AppButton } from './AppButton';

describe('AppButton', () => {
  it('renders its children', () => {
    render(<AppButton>Click me</AppButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<AppButton onClick={onClick}>Save</AppButton>);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows a loading spinner when the loading prop is set', () => {
    render(<AppButton loading>Loading</AppButton>);
    expect(screen.getByRole('button')).toHaveClass('ant-btn-loading');
  });
});
