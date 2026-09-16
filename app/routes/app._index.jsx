import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    {
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            status
            totalInventory
            featuredImage {
              url
            }
          }
        }
      }
    }
  `);

  const data = await response.json();

  return {
    products: data.data.products.edges.map(({ node }) => node),
  };
};

export default function Index() {
  const { products } = useLoaderData();

  return (
    <s-page heading="ADP Showroom Availability">
      <s-section heading="Showroom Product Availability">
        <s-paragraph>
          Check the current availability of Alexandre de Paris products.
        </s-paragraph>

        <s-table>
          <s-table-header-row>
            <s-table-header>Product</s-table-header>
            <s-table-header>Status</s-table-header>
            <s-table-header>Inventory</s-table-header>
          </s-table-header-row>

          <s-table-body>
            {products.map((product) => (
              <s-table-row key={product.id}>
                <s-table-cell>{product.title}</s-table-cell>
                <s-table-cell>{product.status}</s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
      </s-section>
    </s-page>
  );
}