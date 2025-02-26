import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

class GraphQLService {
  static final HttpLink httpLink = HttpLink("https://darkturquoise-stork-856497.hostingersite.com/graphql");

  static ValueNotifier<GraphQLClient> client = ValueNotifier(
    GraphQLClient(
      link: httpLink,
      cache: GraphQLCache(),
    ),
  );

  Future<QueryResult> fetchPosts() async {
    String query = """
      query {
        categorias {
          nodes {
            name
            slug
            pECS {
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
    """;

    QueryResult result = await client.value.query(QueryOptions(document: gql(query)));
    return result;
    
  }

}
