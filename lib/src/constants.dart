import 'appIcons.dart';
import 'package:flutter/material.dart';

const routeHome = '/';
const routeSettings = '/settings';
const routeProfile = '/profile';
const routePrefixDeviceSetup = '/setup/';
const routeDeviceSetupStart = '/setup/$routeDeviceSetupStartPage';
const routeDeviceSetupStartPage = 'find_devices';
const routeDeviceSetupSelectDevicePage = 'select_device';
const routeDeviceSetupConnectingPage = 'connecting';
const routeDeviceSetupFinishedPage = 'finished';

const List bottomNav = [
  {'icon': iconPecs, 'route': '/', 'title': 'Pecs'},
  {'icon': iconPhrases, 'route': '/settings', 'title': 'Frases'},
  {'icon': iconLearn, 'route': 'find_devices', 'title': 'Aprender'},
  {'icon': iconRoutine, 'route': 'finished', 'title': 'Rotina'},
];

const List phrases = [
  {
    'category': 'Todas',
    'collection': [
      [
        {
          'text': 'Oi',
          'image': 'assets/images/avatar_default_v2.png',
          'color': Colors.greenAccent
        },
        {
          'text': 'Tchau',
          'image': 'assets/images/avatar_default_v2.png',
          'color': Colors.orange
        },
        {
          'text': 'Obrigado',
          'image': 'assets/images/avatar_default_v2.png',
          'color': Colors.greenAccent
        },
      ],
      [
        {
          'text': 'Quero',
          'image': 'assets/images/avatar_default_v2.png',
          'color': Colors.greenAccent
        },
        {
          'text': 'Comer',
          'image': 'assets/images/avatar_default_v2.png',
          'color': Colors.orange
        },
        {
          'text': 'Banana',
          'image': 'assets/images/avatar_default_v2.png',
          'color': Colors.greenAccent
        },
      ],
    ]
  }
];

// Map string values to actual Color objects
final Map<String, Color> colorMap = {
  "greenAccent": Colors.greenAccent.shade700,
  "orange": Colors.orange.shade700,
  "deepOrange": Colors.deepOrange.shade700,
  "pink": Colors.pink.shade700,
  "blue": Colors.blue.shade700,
  "teal": Colors.teal.shade700,
  "deepPurple": Colors.deepPurple.shade700,
  "brown": Colors.brown.shade700,
  "cyan": Colors.cyan.shade700,
  "blueGrey": Colors.blueGrey.shade700,
  "grey": Colors.grey.shade700,
  "lightGreen": Colors.lightGreen.shade700,
  "purple": Colors.purple.shade700,
  "indigo": Colors.indigo.shade700,
  "yellow": Colors.yellow.shade700,
};

Color getColorFromString(String colorName) {
  return colorMap[colorName] ?? Colors.grey; // Default to grey if not found
}

final String fetchCategoriesQuery = """
  query {
    categorias {
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
