import { render, screen, fireEvent } from '@testing-library/react-native';
import { HistoryScreen } from '../HistoryScreen';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));

describe('HistoryScreen', () => {
  it('renders items and opens one', () => {
    const onOpen = jest.fn();
    render(<HistoryScreen items={[{ headword: 'apple' }, { headword: 'book' }]} onOpen={onOpen} onClear={() => {}} />);
    fireEvent.press(screen.getByText('apple'));
    expect(onOpen).toHaveBeenCalledWith('apple');
  });

  it('clears history', () => {
    const onClear = jest.fn();
    render(<HistoryScreen items={[{ headword: 'apple' }]} onOpen={() => {}} onClear={onClear} />);
    fireEvent.press(screen.getByRole('button', { name: /clear/i }));
    expect(onClear).toHaveBeenCalled();
  });

  it('shows an empty state', () => {
    render(<HistoryScreen items={[]} onOpen={() => {}} onClear={() => {}} />);
    expect(screen.getByText(/no history/i)).toBeTruthy();
  });
});
