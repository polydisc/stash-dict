import { render, fireEvent } from '@testing-library/react-native';
import { IconButton } from '../IconButton';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null, MaterialCommunityIcons: () => null }));

describe('IconButton', () => {
  it('fires onPress and exposes its accessibility label', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <IconButton name="star" accessibilityLabel="Favorite" onPress={onPress} />,
    );
    fireEvent.press(getByLabelText('Favorite'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders a material-family icon', () => {
    const { getByLabelText } = render(
      <IconButton name="star" family="material" accessibilityLabel="Favorite" onPress={() => {}} />,
    );
    expect(getByLabelText('Favorite')).toBeTruthy();
  });
});
