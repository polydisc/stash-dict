import { render, screen, fireEvent } from '@testing-library/react-native';
import { SettingsScreen } from '../SettingsScreen';
import { SettingsProvider } from '../SettingsContext';
import type { AppSettings, ThemePref } from '../../../db/settings/repository';

jest.mock('@react-native-community/slider', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: Record<string, unknown>) =>
    React.createElement(View, { ...props, testID: 'font-slider' });
});

function fakeService(initial: AppSettings) {
  let state = { ...initial };
  return {
    get: () => state,
    setTheme: jest.fn((t: ThemePref) => { state = { ...state, theme: t }; }),
    setFontScale: jest.fn((s: number) => { state = { ...state, fontScale: s }; }),
  };
}

function renderWithSettings(service: ReturnType<typeof fakeService>) {
  return render(
    <SettingsProvider service={service}>
      <SettingsScreen />
    </SettingsProvider>,
  );
}

describe('SettingsScreen', () => {
  it('changes the theme', () => {
    const service = fakeService({ theme: 'system', fontScale: 1 });
    renderWithSettings(service);
    fireEvent.press(screen.getByRole('button', { name: 'Dark' }));
    expect(service.setTheme).toHaveBeenCalledWith('dark');
  });

  it('persists the font size when the slider gesture completes', () => {
    const service = fakeService({ theme: 'system', fontScale: 1 });
    renderWithSettings(service);
    // Dragging (valueChange) only previews — it must NOT persist.
    fireEvent(screen.getByTestId('font-slider'), 'valueChange', 1.4);
    expect(service.setFontScale).not.toHaveBeenCalled();
    // Releasing (slidingComplete) persists.
    fireEvent(screen.getByTestId('font-slider'), 'slidingComplete', 1.4);
    expect(service.setFontScale).toHaveBeenCalledWith(1.4);
  });

  it('resets the font size to default', () => {
    const service = fakeService({ theme: 'system', fontScale: 1.4 });
    renderWithSettings(service);
    fireEvent.press(screen.getByLabelText('Reset font size'));
    expect(service.setFontScale).toHaveBeenCalledWith(1);
  });
});
