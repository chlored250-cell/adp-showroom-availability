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
  /*
   * IMPORTANT:
   *
   * Do NOT hide pickup when products are split
   * between Dubai and Abu Dhabi.
   *
   * Shopify should handle the native pickup
   * availability.
   *
   * This function should currently make no
   * changes to Shopify's pickup options.
   */

  return NO_CHANGES;
}