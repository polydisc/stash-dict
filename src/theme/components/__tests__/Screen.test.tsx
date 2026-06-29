import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Screen } from '../Screen';

describe('Screen', () => {
  it('renders children', () => {
    const { getByText } = render(<Screen><Text>inside</Text></Screen>);
    expect(getByText('inside')).toBeTruthy();
  });
});
