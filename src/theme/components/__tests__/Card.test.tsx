import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from '../Card';

describe('Card', () => {
  it('renders children', () => {
    const { getByText } = render(<Card><Text>panel</Text></Card>);
    expect(getByText('panel')).toBeTruthy();
  });
});
