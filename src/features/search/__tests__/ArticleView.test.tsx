import { render, screen, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ArticleView } from '../ArticleView';

describe('ArticleView', () => {
  it('renders a plain (m) article as text', () => {
    render(<ArticleView entry={{ headword: 'a', article: 'hello world', articleType: 'm' }} onWordPress={() => {}} />);
    expect(screen.getByText('hello world')).toBeTruthy();
  });

  it('scales font size for plain articles when fontScale is provided', () => {
    const entry = { headword: 'a', article: 'scale test', articleType: 'm' as const };
    const { rerender } = render(<ArticleView entry={entry} onWordPress={() => {}} fontScale={1} />);
    const styleAt1 = StyleSheet.flatten(screen.getByText('scale test').props.style);
    rerender(<ArticleView entry={entry} onWordPress={() => {}} fontScale={2} />);
    const styleAt2 = StyleSheet.flatten(screen.getByText('scale test').props.style);
    expect(styleAt2.fontSize).toBeGreaterThan(styleAt1.fontSize as number);
  });

  it('renders an HTML (h) article and intercepts bword links', () => {
    const onWordPress = jest.fn();
    render(
      <ArticleView
        entry={{ headword: 'a', article: '<a href="bword://banana">see banana</a>', articleType: 'h' }}
        onWordPress={onWordPress}
      />,
    );
    fireEvent.press(screen.getByLabelText('rendered-html'));
    expect(onWordPress).toHaveBeenCalledWith('banana');
  });

  it('ignores external links in HTML articles', () => {
    const onWordPress = jest.fn();
    render(
      <ArticleView
        entry={{ headword: 'a', article: '<a href="https://x.com">x</a>', articleType: 'h' }}
        onWordPress={onWordPress}
      />,
    );
    fireEvent.press(screen.getByLabelText('rendered-html'));
    expect(onWordPress).not.toHaveBeenCalled();
  });
});
