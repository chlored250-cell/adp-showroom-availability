import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin } = await authenticate.public.appProxy(request);

  if (!admin) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const productId = url.searchParams.get("product_id");

  if (!productId) {
    return json({ error: "Missing product_id" }, { status: 400 });
  }

  const response = await admin.graphql(
    `#graphql
      query ProductInventory($id: ID!) {
        product(id: $id) {
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
        id: `gid://shopify/Product/${productId}`,
      },
    },
  );

  const data = await response.json();

  const levels =
    data?.data?.product?.variants?.nodes?.flatMap(
      (variant) => variant?.inventoryItem?.inventoryLevels?.nodes || [],
    ) || [];

  const showroomStock = {
    dubai: false,
    abuDhabi: false,
  };

  for (const level of levels) {
    const quantity =
      level?.quantities?.find((q) => q)?.quantity || 0;



    if (quantity > 0) {
  if (level?.location?.name === "Dubai Showroom") {
    showroomStock.dubai = true;
  }

  if (level?.location?.name === "Galleria Mall, Abu Dhabi") {
    showroomStock.abuDhabi = true;
  }
}
      }
    }
  }

  return json(showroomStock);
}