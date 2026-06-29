import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ListRow } from '../ListRow';

jest.mock('expo-haptics', () => ({ selectionAsync: jest.fn() }));

describe('ListRow', () => {
  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ListRow onPress={onPress}><Text>row</Text></ListRow>,
    );
    fireEvent.press(getByText('row'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders children without onPress', () => {
    const { getByText } = render(<ListRow><Text>static</Text></ListRow>);
    expect(getByText('static')).toBeTruthy();
  });
});
