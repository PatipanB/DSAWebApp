import { Link } from 'react-router-dom';

export function TopBar() {
  return (
    <header className="h-14 bg-bg-surface border-b border-border-subtle flex items-center px-6">
      <Link to="/" className="font-mono text-accent-primary text-base hover:brightness-110">
        DSA Visualizer
      </Link>
    </header>
  );
}
