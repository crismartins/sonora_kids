import 'dart:ffi';
import '../src/appIcons.dart';

const routeHome = '/';
const routeSettings = '/settings';
const routePrefixDeviceSetup = '/setup/';
const routeDeviceSetupStart = '/setup/$routeDeviceSetupStartPage';
const routeDeviceSetupStartPage = 'find_devices';
const routeDeviceSetupSelectDevicePage = 'select_device';
const routeDeviceSetupConnectingPage = 'connecting';
const routeDeviceSetupFinishedPage = 'finished';

const List bottomNav = [
  {'icon': iconPecs, 'route': '', 'title': 'Pecs'},
  {'icon': iconPhrases, 'route': '', 'title': 'Frases'},
  {'icon': iconLearn, 'route': '', 'title': 'Aprender'},
  {'icon': iconRoutine, 'route': '', 'title': 'Rotina'},
];

const String TTS_INPUT = "Fala seu vagabundo!";
