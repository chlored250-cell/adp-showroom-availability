import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      mutation CreateDeliveryCustomization {
        deliveryCustomizationCreate(
          deliveryCustomization: {
            title: "Showroom Delivery"
            functionHandle: "showroom-delivery-function"
            enabled: true
          }
        ) {
          deliveryCustomization {
            id
            title
            enabled
            functionId
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
  );

  const result = await response.json();

  return Response.json(result);
}