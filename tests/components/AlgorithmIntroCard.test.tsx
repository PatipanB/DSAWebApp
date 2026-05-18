import { render, screen } from '@testing-library/react';
import { AlgorithmIntroCard } from '@/components/panels/AlgorithmIntroCard';

describe('AlgorithmIntroCard', () => {
  it('renders intro at step 0', () => {
    render(<AlgorithmIntroCard algorithmId="inorder" stepIndex={0} />);
    expect(screen.getByTestId('algorithm-intro-card')).toBeInTheDocument();
  });
  it('hides after step 0', () => {
    render(<AlgorithmIntroCard algorithmId="inorder" stepIndex={1} />);
    expect(screen.queryByTestId('algorithm-intro-card')).toBeNull();
  });
  it('returns null for unknown id', () => {
    render(<AlgorithmIntroCard algorithmId="unknown" stepIndex={0} />);
    expect(screen.queryByTestId('algorithm-intro-card')).toBeNull();
  });
});
