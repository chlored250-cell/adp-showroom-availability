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
   * Get showroom availability from each product.
   *
   * Expected metafield value:
   * {
   *   "dubai": true,
   *   "abuDhabi": true
   * }
   */

  const showroomLocations = lines.map((line) => {
    const value =
      line?.merchandise?.product?.metafield?.jsonValue;

    return value || {};
  });

  /*
   * Check whether every product can be fulfilled
   * from Dubai.
   */
  const allDubai = showroomLocations.every(
    (location) => location.dubai === true
  );

  /*
   * Check whether every product can be fulfilled
   * from Abu Dhabi.
   */
  const allAbuDhabi = showroomLocations.every(
    (location) => location.abuDhabi === true
  );

  /*
   * If all products can be fulfilled from at least
   * one common showroom, keep pickup available.
   */
  if (allDubai || allAbuDhabi) {
    return NO_CHANGES;
  }

  /*
   * Products are split between different showrooms.
   * Hide pickup options.
   */
  const operations = [];

  for (const group of input.cart.deliveryGroups || []) {
    for (const option of group.deliveryOptions || []) {

      const title = (option.title || "").toLowerCase();

      if (
        title.includes("pickup") ||
        title.includes("pick up") ||
        title.includes("store pickup") ||
        title.includes("in-store")
      ) {
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