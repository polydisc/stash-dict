jest.mock('@expo/vector-icons', () => ({ Feather: () => null, MaterialCommunityIcons: () => null }));

import { render, fireEvent, screen } from '@testing-library/react-native';
import { DictionaryRow } from '../DictionaryRow';

const dict = { dictId: 1, name: 'My Dict', wordCount: 1234, enabled: true, sortOrder: 0 };

describe('DictionaryRow', () => {
  it('shows the name and word count', () => {
    render(<DictionaryRow dictionary={dict} onToggle={() => {}} onDelete={() => {}} onRename={() => {}} />);
    expect(screen.getByText('My Dict')).toBeTruthy();
    expect(screen.getByText(/1234/)).toBeTruthy();
  });

  it('fires onToggle when the switch changes', () => {
    const onToggle = jest.fn();
    render(<DictionaryRow dictionary={dict} onToggle={onToggle} onDelete={() => {}} onRename={() => {}} />);
    fireEvent(screen.getByRole('switch'), 'valueChange', false);
    expect(onToggle).toHaveBeenCalledWith(1, false);
  });

  it('fires onRename when the edit button is pressed', () => {
    const onRename = jest.fn();
    render(<DictionaryRow dictionary={dict} onToggle={() => {}} onDelete={() => {}} onRename={onRename} />);
    fireEvent.press(screen.getByLabelText('Rename My Dict'));
    expect(onRename).toHaveBeenCalledWith(1);
  });
});
