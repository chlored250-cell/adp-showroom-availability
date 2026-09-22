import '@shopify/ui-extensions/preact';
import {render} from 'preact';

export default function extension() {
  render(<Extension />, document.body);
}

function Extension() {
  const lines = shopify.lines.value || [];
  const metafields = shopify.appMetafields.value || [];

  if (!lines.length) {
    return null;
  }

  /*
   * Get showroom availability for every product in the cart.
   */
  const availability = lines.map((line) => {
    const productId = line?.merchandise?.product?.id;

    const entry = metafields.find(
      (item) =>
        item.target.type === 'product' &&
        item.target.id === productId &&
        item.metafield.namespace === '$app' &&
        item.metafield.key === 'showroom_availability'
    );

    if (!entry) {
      return {};
    }

    try {
      return JSON.parse(entry.metafield.value);
    } catch {
      return {};
    }
  });

  /*
   * Determine whether the complete cart
   * can be picked up from one showroom.
   */
  const allDubai = availability.every(
    (location) => location.dubai === true
  );

  const allAbuDhabi = availability.every(
    (location) => location.abuDhabi === true
  );

  /*
   * Mixed showroom cart:
   * some products are Dubai-only and
   * others are Abu Dhabi-only.
   */
  if (!allDubai && !allAbuDhabi) {
    return (
      <s-box
        padding="base"
        border="base"
        borderRadius="base"
      >
        <s-stack gap="tight">

          <s-text type="strong">
            Store pickup isn't available for this order
          </s-text>

          <s-text color="subdued">
            Your items are currently available at
            different showrooms.
          </s-text>

          <s-text color="subdued">
            Please choose delivery, or place separate
            orders to collect your items from our
            showrooms.
          </s-text>

        </s-stack>
      </s-box>
    );
  }

  /*
   * If Shopify already has a valid pickup location,
   * don't duplicate the native Shopify pickup card.
   *
   * Shopify will display:
   * Dubai Showroom / Abu Dhabi Showroom
   * FREE
   * Usually ready in 4 hours
   */
  return null;
}