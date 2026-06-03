import { Category } from "@/types";

const GRAPHQL_ENDPOINT =
  "https://darkturquoise-stork-856497.hostingersite.com/graphql";

const FETCH_CATEGORIES_QUERY = `
  query {
    categorias(where: { orderby: TERM_ORDER, order: ASC }, first: 20) {
      nodes {
        name
        slug
        categoriasDePec {
          configuracoesCategorias {
            cor
            icone {
              node {
                mediaItemUrl
              }
            }
          }
        }
        pECS(where: { orderby: { order: ASC, field: MENU_ORDER } }, first: 20) {
          nodes {
            id
            title
            featuredImage {
              node {
                sourceUrl
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: FETCH_CATEGORIES_QUERY }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? "GraphQL error");
  }

  return json?.data?.categorias?.nodes ?? [];
}
