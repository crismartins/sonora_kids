import 'package:flutter/material.dart';
import '../services/graphql_service.dart';

class CategoryViewModel extends ChangeNotifier {
  List<dynamic> categories = [];
  bool isLoading = true;

  CategoryViewModel() {
    fetchCategories();
  }

  Future<void> fetchCategories() async {
    try {
      categories = await GraphQLService().fetchCategories();
    } catch (e) {
      print("Error fetching categories: $e");
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
