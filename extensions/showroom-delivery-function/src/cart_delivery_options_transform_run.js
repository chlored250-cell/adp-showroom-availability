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

  const showroomLocations = lines.map((line) => {
    return line?.merchandise?.product?.metafield?.jsonValue || {};
  });

  const allDubai = showroomLocations.every(
    (location) => location.dubai === true
  );

  const allAbuDhabi = showroomLocations.every(
    (location) => location.abuDhabi === true
  );

  // Same showroom → leave Shopify pickup options untouched.
  if (allDubai || allAbuDhabi) {
    return NO_CHANGES;
  }

  // Split between Dubai and Abu Dhabi → hide pickup.
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