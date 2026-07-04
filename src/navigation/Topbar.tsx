import { useState } from 'react';
import { HelpIcon, MenuIcon } from './icons';
import Modal from './Modal';
import DatasetToggle from './DatasetToggle';

type TopbarProps = {
  title: string;
};

export default function Topbar({ title }: TopbarProps) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="icon-btn topbar-menu"
          aria-label="Toggle menu"
        >
          <MenuIcon />
        </button>
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="topbar-actions">
        <DatasetToggle />
        <button
          type="button"
          className="icon-btn"
          aria-label="Help"
          aria-haspopup="dialog"
          onClick={() => setHelpOpen(true)}
        >
          <HelpIcon />
        </button>
      </div>

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Help" />
    </header>
  );
}
