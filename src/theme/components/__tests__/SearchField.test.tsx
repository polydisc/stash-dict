import { render, fireEvent } from '@testing-library/react-native';
import { SearchField } from '../SearchField';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));

describe('SearchField', () => {
  it('reports typed text', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchField value="" onChangeText={onChangeText} placeholder="Search" />,
    );
    fireEvent.changeText(getByPlaceholderText('Search'), 'lex');
    expect(onChangeText).toHaveBeenCalledWith('lex');
  });

  it('shows a clear button that empties the field', () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = render(
      <SearchField value="lex" onChangeText={onChangeText} placeholder="Search" />,
    );
    fireEvent.press(getByLabelText('Clear search'));
    expect(onChangeText).toHaveBeenCalledWith('');
  });

  it('hides the clear button when empty', () => {
    const { queryByLabelText } = render(
      <SearchField value="" onChangeText={jest.fn()} placeholder="Search" />,
    );
    expect(queryByLabelText('Clear search')).toBeNull();
  });
});
