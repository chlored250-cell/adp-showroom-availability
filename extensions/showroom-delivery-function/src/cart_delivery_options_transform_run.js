// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").CartDeliveryOptionsTransformRunResult} CartDeliveryOptionsTransformRunResult
 */

/**
 * @type {CartDeliveryOptionsTransformRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {CartDeliveryOptionsTransformRunResult}
 */
export function cartDeliveryOptionsTransformRun(input) {
  const lines = input?.cart?.lines || [];

  if (!lines.length) {
    return NO_CHANGES;
  }

  /*
   * Get showroom availability for every product.
   *
   * Expected metafield:
   * {
   *   "dubai": true,
   *   "abuDhabi": false
   * }
   */

  const showroomLocations = lines.map((line) => {
    return line?.merchandise?.product?.metafield?.jsonValue || {};
  });

  /*
   * Check whether ALL products are available
   * in Dubai.
   */
  const allDubai = showroomLocations.every(
    (location) => location.dubai === true
  );

  /*
   * Check whether ALL products are available
   * in Abu Dhabi.
   */
  const allAbuDhabi = showroomLocations.every(
    (location) => location.abuDhabi === true
  );

  /*
   * If every item is available in the same showroom,
   * keep Shopify's pickup option.
   */
  if (allDubai || allAbuDhabi) {
    return NO_CHANGES;
  }

  /*
   * Items are split between Dubai and Abu Dhabi.
   *
   * Hide ONLY pickup options.
   * Delivery must remain available.
   */
  const operations = [];

  for (const group of input.cart.deliveryGroups || []) {
    for (const option of group.deliveryOptions || []) {

      /*
       * Shopify's actual delivery method type.
       *
       * PICK_UP = pickup
       * SHIPPING = delivery/shipping
       */
      if (option.deliveryMethodType === "PICK_UP") {
        operations.push({
          deliveryOptionHide: {
            deliveryOptionHandle: option.handle,
          },
        });
      }
    }
  }

  return {
    operations,
  };
}