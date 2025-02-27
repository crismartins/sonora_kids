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
  "greenAccent": Colors.greenAccent,
  "orange": Colors.orange,
  "deepOrange": Colors.deepOrange,
  "pink": Colors.pink,
  "blue": Colors.blue,
  "teal": Colors.teal,
  "deepPurple": Colors.deepPurple,
  "brown": Colors.brown,
  "cyan": Colors.cyan,
  "blueGrey": Colors.blueGrey,
  "grey": Colors.grey,
  "lightGreen": Colors.lightGreen,
  "purple": Colors.purple,
  "indigo": Colors.indigo,
  "yellow": Colors.yellow,
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

const List pecs = [
  {
    'category': 'Boas Maneiras',
    'icon': 'assets/images/bye.png',
    'color': Colors.greenAccent,
    'collection': [
      {'text': 'Oi', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Tchau', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Obrigado', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'De nada', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Por favor', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Bom dia', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Boa Tarde', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Boa Noite', 'image': 'assets/images/avatar_default_v2.png'},
    ]
  },
  {
    'category': 'Sentimentos',
    'icon': 'assets/images/sentimentos.png',
    'color': Colors.orange,
    'collection': [
      {'text': 'Feliz', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Triste', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Bravo', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Chateado', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Entediado', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Fome', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Dor', 'image': 'assets/images/avatar_default_v2.png'},
    ]
  },
  {
    'category': 'Comida e Bebida',
    'icon': 'assets/images/comida-e-bebida.png',
    'color': Colors.deepOrange,
    'collection': [
      {'text': 'Água', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Maçã', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Banana', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Ovo', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Café da Manhã', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Almoço', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Jantar', 'image': 'assets/images/avatar_default_v2.png'},
    ]
  },
  {
    'category': 'Necessidades',
    'icon': 'assets/images/necessidades.png',
    'color': Colors.pink,
    'collection': [
      {'text': 'Xixi', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Cocô', 'image': 'assets/images/avatar_default_v2.png'},
    ]
  },
  {
    'category': 'Objetos e Brinquedos',
    'icon': 'assets/images/objetos.png',
    'color': Colors.blue,
    'collection': [
      {'text': 'Bola', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Boneca', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Televisão', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Celular', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Tablet', 'image': 'assets/images/avatar_default_v2.png'},
    ]
  },
  {
    'category': 'Pessoas',
    'icon': 'assets/images/pessoas.png',
    'color': Colors.teal,
    'collection': [
      {'text': 'Mamãe', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Papai', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Titia', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Titio', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Vovó', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Vovô', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Dinda', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Dindo', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Madrinha', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Padrinho', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Professora', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Professor', 'image': 'assets/images/avatar_default_v2.png'},
    ]
  },
  {
    'category': 'Dia a Dia',
    'icon': 'assets/images/dia-a-dia.png',
    'color': Colors.deepPurple,
    'collection': [
      {'text': 'Acordar', 'image': 'assets/images/avatar_default_v2.png'},
      {
        'text': 'Arrumar a cama',
        'image': 'assets/images/avatar_default_v2.png'
      },
      {'text': 'Café da Manhã', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Almoço', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Terapia', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Jantar', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Dormir', 'image': 'assets/images/avatar_default_v2.png'},
    ]
  },
  {
    'category': 'Animais',
    'icon': 'assets/images/animais.png',
    'color': Colors.brown,
    'collection': [
      {'text': 'Abelha', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Gato', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Cachorro', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Leão', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Jacaré', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Girafa', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Zebra', 'image': 'assets/images/avatar_default_v2.png'},
    ]
  },
  {
    'category': 'Perguntas e Respostas',
    'icon': 'assets/images/perguntas.png',
    'color': Colors.cyan,
    'collection': [
      {'text': 'Feliz', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Triste', 'image': 'assets/images/avatar_default_v2.png'},
    ]
  },
  {
    'category': 'Datas e Eventos',
    'icon': 'assets/images/eventos-datas.png',
    'color': Colors.blueGrey,
    'collection': [
      {'text': 'Feliz', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Triste', 'image': 'assets/images/avatar_default_v2.png'},
    ]
  },
  {
    'category': 'Formas e Cores',
    'icon': 'assets/images/formas-e-cores.png',
    'color': Colors.grey,
    'collection': [
      {'text': 'Feliz', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Triste', 'image': 'assets/images/avatar_default_v2.png'},
    ]
  },
  {
    'category': 'Lugares',
    'icon': 'assets/images/lugares.png',
    'color': Colors.lightGreen,
    'collection': [
      {'text': 'Feliz', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Triste', 'image': 'assets/images/avatar_default_v2.png'},
    ]
  },
  {
    'category': 'Ações e Atividades',
    'icon': 'assets/images/atividades.png',
    'color': Colors.purple,
    'collection': [
      {'text': 'Feliz', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Triste', 'image': 'assets/images/avatar_default_v2.png'},
    ]
  },
  {
    'category': 'Roupas e Acessórios',
    'icon': 'assets/images/roupas.png',
    'color': Colors.indigo,
    'collection': [
      {'text': 'Feliz', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Triste', 'image': 'assets/images/avatar_default_v2.png'},
    ]
  },
  {
    'category': 'Transporte',
    'icon': 'assets/images/transporte.png',
    'color': Colors.yellow,
    'collection': [
      {'text': 'Feliz', 'image': 'assets/images/avatar_default_v2.png'},
      {'text': 'Triste', 'image': 'assets/images/avatar_default_v2.png'},
    ]
  },
];
