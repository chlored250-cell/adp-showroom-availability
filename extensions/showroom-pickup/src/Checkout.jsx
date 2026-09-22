import '@shopify/ui-extensions/preact';
import {render} from 'preact';

export default function extension() {
  render(<Extension />, document.body);
}

function Extension() {
  const lines = shopify.lines.value || [];

  if (!lines.length) {
    return null;
  }

  /*
   * Shopify's native pickup-location list is responsible
   * for displaying the actual available locations.
   *
   * This extension adds showroom-specific guidance
   * above that native list.
   */

  return (
    <s-box padding="base">
      <s-stack gap="tight">

        <s-text type="strong">
          Showroom Pickup
        </s-text>

        <s-text color="subdued">
          Select a showroom below to collect your order.
        </s-text>

        <s-text color="subdued">
          Your order will usually be ready within 4 hours.
        </s-text>

      </s-stack>
    </s-box>
  );
}