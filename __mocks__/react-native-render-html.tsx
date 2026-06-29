import { Text } from 'react-native';

export default function RenderHtml(props: {
  source: { html: string };
  renderersProps?: { a?: { onPress?: (e: unknown, href: string) => void } };
}) {
  // Expose the html and a test hook for the anchor onPress via accessibilityLabel.
  return (
    <Text
      accessibilityLabel="rendered-html"
      onPress={() => {
        const href = props.source.html.match(/href="([^"]+)"/)?.[1];
        if (href) props.renderersProps?.a?.onPress?.(null, href);
      }}
    >
      {props.source.html}
    </Text>
  );
}
