import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { ReactNode } from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component that uses the theme hook
function TestComponent() {
  const { theme, toggleTheme, switchable } = useTheme();
  return (
    <div>
      <div data-testid="theme-display">{theme}</div>
      <div data-testid="switchable-display">{switchable.toString()}</div>
      {toggleTheme && (
        <button data-testid="toggle-button" onClick={toggleTheme}>
          Toggle Theme
        </button>
      )}
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should provide default light theme when not switchable', () => {
    render(
      <ThemeProvider defaultTheme="light" switchable={false}>
        <TestComponent />
      </ThemeProvider>
    );

    const themeDisplay = screen.getByTestId('theme-display');
    expect(themeDisplay.textContent).toBe('light');
  });

  it('should provide dark theme when set as default', () => {
    render(
      <ThemeProvider defaultTheme="dark" switchable={false}>
        <TestComponent />
      </ThemeProvider>
    );

    const themeDisplay = screen.getByTestId('theme-display');
    expect(themeDisplay.textContent).toBe('dark');
  });

  it('should add dark class to document when theme is dark', () => {
    render(
      <ThemeProvider defaultTheme="dark" switchable={false}>
        <TestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should remove dark class from document when theme is light', () => {
    render(
      <ThemeProvider defaultTheme="light" switchable={false}>
        <TestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should toggle theme when switchable is true', () => {
    render(
      <ThemeProvider defaultTheme="light" switchable={true}>
        <TestComponent />
      </ThemeProvider>
    );

    const themeDisplay = screen.getByTestId('theme-display');
    const toggleButton = screen.getByTestId('toggle-button');

    expect(themeDisplay.textContent).toBe('light');

    fireEvent.click(toggleButton);

    expect(themeDisplay.textContent).toBe('dark');

    fireEvent.click(toggleButton);

    expect(themeDisplay.textContent).toBe('light');
  });

  it('should persist theme to localStorage when switchable', () => {
    const { rerender } = render(
      <ThemeProvider defaultTheme="light" switchable={true}>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');
    fireEvent.click(toggleButton);

    expect(localStorage.getItem('theme')).toBe('dark');

    rerender(
      <ThemeProvider defaultTheme="light" switchable={true}>
        <TestComponent />
      </ThemeProvider>
    );

    const themeDisplay = screen.getByTestId('theme-display');
    expect(themeDisplay.textContent).toBe('dark');
  });

  it('should restore theme from localStorage on mount', () => {
    localStorage.setItem('theme', 'dark');

    render(
      <ThemeProvider defaultTheme="light" switchable={true}>
        <TestComponent />
      </ThemeProvider>
    );

    const themeDisplay = screen.getByTestId('theme-display');
    expect(themeDisplay.textContent).toBe('dark');
  });

  it('should not have toggleTheme function when switchable is false', () => {
    render(
      <ThemeProvider defaultTheme="light" switchable={false}>
        <TestComponent />
      </ThemeProvider>
    );

    const switchableDisplay = screen.getByTestId('switchable-display');
    expect(switchableDisplay.textContent).toBe('false');

    const toggleButton = screen.queryByTestId('toggle-button');
    expect(toggleButton).toBeNull();
  });

  it('should have toggleTheme function when switchable is true', () => {
    render(
      <ThemeProvider defaultTheme="light" switchable={true}>
        <TestComponent />
      </ThemeProvider>
    );

    const switchableDisplay = screen.getByTestId('switchable-display');
    expect(switchableDisplay.textContent).toBe('true');

    const toggleButton = screen.getByTestId('toggle-button');
    expect(toggleButton).not.toBeNull();
  });

  it('should throw error when useTheme is used outside ThemeProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within ThemeProvider');

    consoleError.mockRestore();
  });
});
