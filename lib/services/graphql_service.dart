import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

class GraphQLService {
  static final HttpLink httpLink =
      HttpLink('https://darkturquoise-stork-856497.hostingersite.com/graphql');

  static final ValueNotifier<GraphQLClient> client = ValueNotifier(
    GraphQLClient(
      link: httpLink,
      cache: GraphQLCache(),
    ),
  );

  static const String fetchCategoriesQuery = '''
    query {
      categorias(where: {orderby: TERM_ORDER, order: ASC}, first: 20) {
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
          pECS(where: {orderby: {order: ASC, field: MENU_ORDER}}, first: 20) {
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
  ''';

  Future<List<dynamic>> fetchCategories() async {
    final QueryOptions options =
        QueryOptions(document: gql(fetchCategoriesQuery));

    final QueryResult result = await client.value.query(options);

    if (result.hasException) {
      throw Exception(result.exception.toString());
    }

    return result.data?['categorias']['nodes'] ?? [];
  }
}
