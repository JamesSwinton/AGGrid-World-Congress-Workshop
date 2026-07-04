import type { SVGProps } from 'react';

// Lightweight feather-style stroke icons, dependency-free.
// Each inherits `currentColor` so buttons/links control the color.

type IconProps = SVGProps<SVGSVGElement>;

function Icon({
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

// Step 1 — getting started / setup
export const RocketIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </Icon>
);

// Step 2 — column definitions
export const ColumnsIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M12 3v18" />
  </Icon>
);

// Step 3 — row data
export const DatabaseIcon = (p: IconProps) => (
  <Icon {...p}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14a9 3 0 0 0 18 0V5" />
    <path d="M3 12a9 3 0 0 0 18 0" />
  </Icon>
);

// Step 4 — features / polish
export const SparklesIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </Icon>
);

// POC — data visualisation dashboard / chart view
export const ChartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 3v18h18" />
    <path d="M7 16v2" />
    <path d="M12 12v6" />
    <path d="M17 8v10" />
  </Icon>
);

// Table view — a gridded rectangle with a header row + one column divider.
export const TableIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M3 15h18" />
    <path d="M12 3v18" />
  </Icon>
);

export const HelpIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
);

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </Icon>
);

// Official AG Grid logo mark — a fixed multicolor logo, so it renders its own
// <svg> rather than the monochrome stroke `Icon` wrapper. The viewBox is
// centered on the artwork's bounding box (x 12–64, y 18–54).
export const AgGridIcon = (p: IconProps) => (
  <svg viewBox="8 6 60 60" width="24" height="24" aria-hidden="true" {...p}>
    <path
      fill="#b4bbbf"
      d="M12 49.988 19 50h4v-4l3.992-4L12 41.953v8.035ZM22 38h9l4 .002V34l4-4H22v8ZM17 18h30v8H17z"
    />
    <path fill="#ff0000" d="M19 50.01 23 46h14v8H19v-3.99Z" />
    <path fill="#ff8b00" d="M49 42v-7.995H35L26.992 42H49Z" />
    <path fill="#55b2c6" d="M64 22H47l-8 8h25v-8Z" />
  </svg>
);
