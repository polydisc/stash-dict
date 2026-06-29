import { render } from '@testing-library/react-native';
import { AppText } from '../AppText';

describe('AppText', () => {
  it('renders its children', () => {
    const { getByText } = render(<AppText>hello</AppText>);
    expect(getByText('hello')).toBeTruthy();
  });

  it('passes through testID for any variant', () => {
    const { getByTestId } = render(<AppText testID="t" variant="display">x</AppText>);
    expect(getByTestId('t')).toBeTruthy();
  });
});
