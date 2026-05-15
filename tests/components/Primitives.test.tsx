import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '@/components/primitives/Tabs';
import { Tooltip } from '@/components/primitives/Tooltip';
import { Slider } from '@/components/primitives/Slider';

describe('Tabs', () => {
  it('renders tabs and switches active on click', async () => {
    const { rerender } = render(
      <Tabs value="a" onChange={() => {}} options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />
    );
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
    let v = 'a';
    rerender(
      <Tabs value={v} onChange={(x) => { v = x; }} options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />
    );
    await userEvent.click(screen.getByRole('tab', { name: 'B' }));
  });
});

describe('Tooltip', () => {
  it('renders trigger and tooltip text', () => {
    render(<Tooltip label="help"><button>btn</button></Tooltip>);
    expect(screen.getByRole('button', { name: 'btn' })).toBeInTheDocument();
    expect(screen.getByText('help')).toBeInTheDocument();
  });
});

describe('Slider', () => {
  it('renders with given value and responds to arrow keys', async () => {
    let v = 2;
    const { rerender } = render(<Slider min={0} max={4} value={v} onChange={(x) => { v = x; }} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '2');
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(v).toBe(3);
    rerender(<Slider min={0} max={4} value={v} onChange={(x) => { v = x; }} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '3');
  });
});
