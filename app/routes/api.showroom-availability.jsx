import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin } = await authenticate.public.appProxy(request);

  if (!admin) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const url = new URL(request.url);
  const productId = url.searchParams.get("product_id");

  if (!productId) {
    return new Response(
      JSON.stringify({ error: "Missing product_id" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const productGid = `gid://shopify/Product/${productId}`;

  const response = await admin.graphql(
    `#graphql
      query ProductInventory($id: ID!) {
        product(id: $id) {
          id

          variants(first: 100) {
            nodes {
              inventoryItem {
                inventoryLevels(first: 100) {
                  nodes {
                    quantities(names: ["available"]) {
                      quantity
                    }

                    location {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      variables: {
        id: productGid,
      },
    }
  );

  const data = await response.json();

  const levels =
    data?.data?.product?.variants?.nodes?.flatMap(
      (variant) =>
        variant?.inventoryItem?.inventoryLevels?.nodes || []
    ) || [];

  const showroomStock = {
    dubai: false,
    abuDhabi: false,
  };

  for (const level of levels) {
    const quantity =
      level?.quantities?.find(
        (quantity) => quantity?.quantity !== undefined
      )?.quantity || 0;

    const locationName =
      level?.location?.name || "";

    if (quantity > 0) {
      if (locationName === "Dubai Showroom") {
        showroomStock.dubai = true;
      }

      if (locationName === "Galleria Mall, Abu Dhabi") {
        showroomStock.abuDhabi = true;
      }
    }
  }

  /*
   * Save showroom availability to the product metafield.
   */

  const metafieldResponse = await admin.graphql(
    `#graphql
      mutation UpdateShowroomAvailability(
        $metafields: [MetafieldsSetInput!]!
      ) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
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
        metafields: [
          {
            ownerId: productGid,
            namespace: "$app",
            key: "showroom_availability",
            type: "json",
            value: JSON.stringify(showroomStock),
          },
        ],
      },
    }
  );

  const metafieldData = await metafieldResponse.json();

  const userErrors =
    metafieldData?.data?.metafieldsSet?.userErrors || [];

  if (userErrors.length > 0) {
    console.error(
      "Showroom availability metafield error:",
      userErrors
    );
  }

  return new Response(
    JSON.stringify(showroomStock),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}