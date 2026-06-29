import { render } from '@testing-library/react-native';
import { SectionHeader } from '../SectionHeader';

describe('SectionHeader', () => {
  it('renders its label text', () => {
    const { getByText } = render(<SectionHeader>最近の検索</SectionHeader>);
    expect(getByText('最近の検索')).toBeTruthy();
  });
});
