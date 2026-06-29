import { render, fireEvent } from '@testing-library/react-native';
import { DictionaryFilter } from '../DictionaryFilter';

const dicts = [{ dictId: 1, name: 'Alpha' }, { dictId: 2, name: 'Beta' }];

describe('DictionaryFilter', () => {
  it('toggles a dictionary into the selection', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <DictionaryFilter dictionaries={dicts} selected={[]} onChange={onChange} />,
    );
    fireEvent.press(getByText('Alpha'));
    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it('clears the selection via すべて', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <DictionaryFilter dictionaries={dicts} selected={[1]} onChange={onChange} />,
    );
    fireEvent.press(getByText('すべて'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('removes an already-selected dictionary', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <DictionaryFilter dictionaries={dicts} selected={[1, 2]} onChange={onChange} />,
    );
    fireEvent.press(getByText('Alpha'));
    expect(onChange).toHaveBeenCalledWith([2]);
  });

  it('renders nothing for fewer than two dictionaries', () => {
    const { queryByText } = render(
      <DictionaryFilter dictionaries={[dicts[0]]} selected={[]} onChange={jest.fn()} />,
    );
    expect(queryByText('すべて')).toBeNull();
  });

  it('truncates a long dictionary name but keeps the full accessibility label', () => {
    const onChange = jest.fn();
    const { getByText, getByLabelText } = render(
      <DictionaryFilter
        dictionaries={[{ dictId: 1, name: 'Oxford English' }, { dictId: 2, name: 'Beta' }]}
        selected={[]}
        onChange={onChange}
      />,
    );
    expect(getByText('Oxford…')).toBeTruthy();
    fireEvent.press(getByLabelText('Oxford English'));
    expect(onChange).toHaveBeenCalledWith([1]);
  });
});
