/**
 * CampusONE design system — shared class compositions for JS/JSX.
 * Core tokens live in index.css (@theme + @layer components).
 */

import { cn } from '@/lib/utils';

/** Responsive page widths */
export const containerSizes = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
};

/** Horizontal padding aligned with AppShell main */
export const containerPadding = 'px-4 sm:px-6 lg:px-8';

export function containerClass(size = 'default', className) {
  return cn('co-container mx-auto w-full', containerSizes[size], containerPadding, className);
}

/** Standard page section vertical rhythm */
export const sectionSpacing = 'space-y-6 sm:space-y-8';

/** Two-column dashboard-style grid */
export const gridPage = 'grid gap-6 sm:gap-8 lg:grid-cols-12';

export const surfaces = {
  page: 'bg-background text-foreground',
  base: 'co-surface',
  raised: 'co-surface-raised',
  inset: 'co-surface-inset',
  sidebar: 'co-sidebar',
};

export const navItem = {
  base: 'co-nav-item',
  active: 'co-nav-item-active',
};

export const typography = {
  display: 'co-text-display',
  title: 'co-text-title',
  heading: 'co-text-heading',
  body: 'co-text-body',
  bodyMuted: 'co-text-body-muted',
  label: 'co-text-label',
  caption: 'co-text-caption',
};
