export interface Theme {
  id: string;
  name: string;
  type: 'dark' | 'light';
}

export const themes: Theme[] = [
  // Dark themes
  { id: 'one-dark', name: 'One Dark', type: 'dark' },
  { id: 'dracula', name: 'Dracula', type: 'dark' },
  { id: 'nord', name: 'Nord', type: 'dark' },
  { id: 'solarized-dark', name: 'Solarized Dark', type: 'dark' },
  { id: 'github-dark', name: 'GitHub Dark', type: 'dark' },
  { id: 'monokai', name: 'Monokai', type: 'dark' },
  { id: 'monokai-pro', name: 'Monokai Pro', type: 'dark' },
  { id: 'gruvbox-dark', name: 'Gruvbox Dark', type: 'dark' },
  { id: 'tokyo-night', name: 'Tokyo Night', type: 'dark' },
  { id: 'catppuccin-mocha', name: 'Catppuccin Mocha', type: 'dark' },
  { id: 'catppuccin-macchiato', name: 'Catppuccin Macchiato', type: 'dark' },
  { id: 'catppuccin-frappe', name: 'Catppuccin Frappe', type: 'dark' },
  { id: 'palenight', name: 'Palenight', type: 'dark' },
  { id: 'synthwave84', name: "Synthwave '84", type: 'dark' },
  { id: 'ayu-dark', name: 'Ayu Dark', type: 'dark' },
  { id: 'ayu-mirage', name: 'Ayu Mirage', type: 'dark' },
  { id: 'material-dark', name: 'Material Dark', type: 'dark' },
  { id: 'material-ocean', name: 'Material Ocean', type: 'dark' },
  { id: 'night-owl', name: 'Night Owl', type: 'dark' },
  { id: 'cobalt2', name: 'Cobalt2', type: 'dark' },
  { id: 'shades-of-purple', name: 'Shades of Purple', type: 'dark' },
  { id: 'horizon-dark', name: 'Horizon Dark', type: 'dark' },
  { id: 'andromeda', name: 'Andromeda', type: 'dark' },
  { id: 'vesper', name: 'Vesper', type: 'dark' },
  { id: 'rose-pine', name: 'Rosé Pine', type: 'dark' },
  { id: 'rose-pine-moon', name: 'Rosé Pine Moon', type: 'dark' },
  { id: 'everforest-dark', name: 'Everforest Dark', type: 'dark' },
  { id: 'kanagawa', name: 'Kanagawa', type: 'dark' },
  { id: 'oxocarbon', name: 'Oxocarbon', type: 'dark' },

  // Light themes
  { id: 'one-light', name: 'One Light', type: 'light' },
  { id: 'solarized-light', name: 'Solarized Light', type: 'light' },
  { id: 'github-light', name: 'GitHub Light', type: 'light' },
  { id: 'gruvbox-light', name: 'Gruvbox Light', type: 'light' },
  { id: 'tokyo-night-light', name: 'Tokyo Night Light', type: 'light' },
  { id: 'catppuccin-latte', name: 'Catppuccin Latte', type: 'light' },
  { id: 'ayu-light', name: 'Ayu Light', type: 'light' },
  { id: 'material-light', name: 'Material Light', type: 'light' },
  { id: 'light-owl', name: 'Light Owl', type: 'light' },
  { id: 'horizon-light', name: 'Horizon Light', type: 'light' },
  { id: 'rose-pine-dawn', name: 'Rosé Pine Dawn', type: 'light' },
  { id: 'everforest-light', name: 'Everforest Light', type: 'light' },
  { id: 'matthias', name: 'Matthias', type: 'light' },
];

export const darkThemes = themes.filter(t => t.type === 'dark');
export const lightThemes = themes.filter(t => t.type === 'light');

export function getThemeById(id: string): Theme | undefined {
  return themes.find(t => t.id === id);
}

export const defaultTheme = 'github-light';

export function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getPreferredTheme(): string {
  if (typeof window === 'undefined') return defaultTheme;

  const stored = localStorage.getItem('theme');
  if (stored && themes.find(t => t.id === stored)) {
    return stored;
  }

  const systemTheme = getSystemTheme();
  return systemTheme === 'dark' ? 'one-dark' : 'github-light';
}

export function setTheme(themeId: string): void {
  if (typeof window === 'undefined') return;

  const html = document.documentElement;

  // Remove all theme classes
  themes.forEach(t => html.classList.remove(`theme-${t.id}`));

  // Add new theme class
  html.classList.add(`theme-${themeId}`);

  // Store preference
  localStorage.setItem('theme', themeId);
}
