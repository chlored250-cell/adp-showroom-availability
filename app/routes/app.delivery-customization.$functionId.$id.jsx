import { authenticate } from "../shopify.server";

export async function loader({ params, request }) {
  const { admin } = await authenticate.admin(request);

  const { id } = params;

  if (id === "new") {
    return Response.json({
      customization: null,
    });
  }

  const response = await admin.graphql(
    `#graphql
      query GetDeliveryCustomization($id: ID!) {
        deliveryCustomization(id: $id) {
          id
          title
          enabled
          metafield(
            namespace: "$app:showroom-delivery-function"
            key: "function-configuration"
          ) {
            value
          }
        }
      }
    `,
    {
      variables: {
        id: `gid://shopify/DeliveryCustomization/${id}`,
      },
    }
  );

  const result = await response.json();

  return Response.json({
    customization: result?.data?.deliveryCustomization,
  });
}

export async function action({ params, request }) {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();

  const title =
    formData.get("title") || "Showroom Delivery";

  const enabled = formData.get("enabled") === "true";

  const input = {
    title,
    enabled,
    functionHandle: "showroom-delivery-function",
  };

  if (params.id === "new") {
    const response = await admin.graphql(
      `#graphql
        mutation CreateDeliveryCustomization(
          $input: DeliveryCustomizationInput!
        ) {
          deliveryCustomizationCreate(
            deliveryCustomization: $input
          ) {
            deliveryCustomization {
              id
              title
              enabled
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      {
        variables: {
          input,
        },
      }
    );

    return Response.json(await response.json());
  }

  const response = await admin.graphql(
    `#graphql
      mutation UpdateDeliveryCustomization(
        $id: ID!
        $input: DeliveryCustomizationInput!
      ) {
        deliveryCustomizationUpdate(
          id: $id
          deliveryCustomization: $input
        ) {
          deliveryCustomization {
            id
            title
            enabled
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        id: `gid://shopify/DeliveryCustomization/${params.id}`,
        input,
      },
    }
  );

  return Response.json(await response.json());
}

export default function DeliveryCustomization() {
  return (
    <s-page heading="Showroom Delivery">
      <s-form method="post">
        <s-section heading="Showroom delivery settings">
          <s-text-field
            name="title"
            label="Customization name"
            value="Showroom Delivery"
          />

          <s-checkbox
            name="enabled"
            value="true"
            checked
            label="Enable showroom delivery customization"
          />
        </s-section>

        <s-button type="submit">
          Save
        </s-button>
      </s-form>
    </s-page>
  );
}