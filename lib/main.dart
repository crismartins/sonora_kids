import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'src/constants.dart';
import 'package:iconify_flutter/iconify_flutter.dart';
import 'src/appIcons.dart';
import 'src/appStyles.dart';
import 'src/components/customNavBar.dart';
import 'package:gap/gap.dart';
import 'package:flutter_tts/flutter_tts.dart';

void main() {
  runApp(
    MaterialApp(
      theme: ThemeData(
          useMaterial3: true,
          fontFamily: 'Dongle',
          cardTheme: CardTheme(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(
                Radius.circular(20.0),
              ),
            ),
          ),
          scaffoldBackgroundColor: Color(colorNeutralLight),
          textTheme: TextTheme(
            titleLarge: TextStyle(fontSize: 32.0),
            titleMedium: TextStyle(
              fontSize: 24.0,
              color: Color(colorDark),
            ),
            bodySmall: TextStyle(fontSize: 14.0),
            bodyMedium: TextStyle(fontSize: 16.0),
            bodyLarge: TextStyle(fontSize: 20.0),
            labelSmall: TextStyle(fontSize: 12.0),
            labelMedium: TextStyle(fontSize: 14.0),
            labelLarge: TextStyle(
                fontSize: 16.0, fontWeight: FontWeight.w400, color: Colors.red),
          ),
          tabBarTheme: TabBarTheme(
            labelColor: Colors.red,
            dividerColor: Colors.transparent,
            labelStyle: TextStyle(
              fontSize: 14.0,
              fontWeight: FontWeight.w400,
            ),
            unselectedLabelStyle: TextStyle(
              fontSize: 14.0,
              color: Colors.white.withOpacity(0.4),
            ),
            indicator: UnderlineTabIndicator(
              borderSide: BorderSide.none,
            ),
            overlayColor: WidgetStatePropertyAll(
              Colors.white.withOpacity(0.1),
            ),
          ),
          textButtonTheme: TextButtonThemeData(
            style: TextButton.styleFrom(
              foregroundColor: Colors.white,
              backgroundColor: Color(colorPrimaryLight),
              textStyle: TextStyle(fontSize: 20),
              padding: EdgeInsets.symmetric(
                vertical: 12.0,
                horizontal: 16.0,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.0),
              ),
            ),
          ),
          appBarTheme: AppBarTheme(
            systemOverlayStyle: SystemUiOverlayStyle(
              statusBarColor: Color(colorNeutralLight),
              statusBarBrightness: Brightness.light,
              statusBarIconBrightness: Brightness.dark,
            ),
            iconTheme: IconThemeData(color: Color(colorNeutralDark)),
            color: Color(colorNeutralLight),
            titleTextStyle: TextStyle(
                color: Color(colorDark), fontFamily: 'Dongle', fontSize: 32.0),
            scrolledUnderElevation: 0.0,
            elevation: 0,
          ),
          navigationBarTheme: NavigationBarThemeData(
            backgroundColor: Colors.transparent,
          )),
      darkTheme: ThemeData.dark(),
      onGenerateRoute: (settings) {
        late Widget page;
        if (settings.name == routeHome) {
          page = const HomeScreen();
        } else if (settings.name == routeSettings) {
          page = const SettingsScreen();
        } else if (settings.name!.startsWith(routePrefixDeviceSetup)) {
          final subRoute =
              settings.name!.substring(routePrefixDeviceSetup.length);
          page = SetupFlow(
            setupPageRoute: subRoute,
          );
        } else {
          throw Exception('Unknown route: ${settings.name}');
        }

        return MaterialPageRoute<dynamic>(
          builder: (context) {
            return page;
          },
          settings: settings,
        );
      },
      debugShowCheckedModeBanner: false,
    ),
  );
}

@immutable
class SetupFlow extends StatefulWidget {
  static SetupFlowState of(BuildContext context) {
    return context.findAncestorStateOfType<SetupFlowState>()!;
  }

  const SetupFlow({
    super.key,
    required this.setupPageRoute,
  });

  final String setupPageRoute;

  @override
  SetupFlowState createState() => SetupFlowState();
}

class SetupFlowState extends State<SetupFlow> {
  final _navigatorKey = GlobalKey<NavigatorState>();

  @override
  void initState() {
    super.initState();
  }

  void _onDiscoveryComplete() {
    _navigatorKey.currentState!.pushNamed(routeDeviceSetupSelectDevicePage);
  }

  void _onDeviceSelected(String deviceId) {
    _navigatorKey.currentState!.pushNamed(routeDeviceSetupConnectingPage);
  }

  void _onConnectionEstablished() {
    _navigatorKey.currentState!.pushNamed(routeDeviceSetupFinishedPage);
  }

  Future<void> _onExitPressed() async {
    final isConfirmed = await _isExitDesired();

    if (isConfirmed && mounted) {
      _exitSetup();
    }
  }

  Future<bool> _isExitDesired() async {
    return await showDialog<bool>(
            context: context,
            builder: (context) {
              return AlertDialog(
                title: const Text('Are you sure?'),
                content: const Text(
                    'If you exit device setup, your progress will be lost.'),
                actions: [
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).pop(true);
                    },
                    child: const Text('Leave'),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).pop(false);
                    },
                    child: const Text('Stay'),
                  ),
                ],
              );
            }) ??
        false;
  }

  void _exitSetup() {
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;

        if (await _isExitDesired() && context.mounted) {
          _exitSetup();
        }
      },
      child: Scaffold(
        appBar: _buildFlowAppBar(),
        body: Navigator(
          key: _navigatorKey,
          initialRoute: widget.setupPageRoute,
          onGenerateRoute: _onGenerateRoute,
        ),
      ),
    );
  }

  Route<Widget> _onGenerateRoute(RouteSettings settings) {
    final page = switch (settings.name) {
      routeDeviceSetupStartPage => WaitingPage(
          message: 'Searching for nearby bulb...',
          onWaitComplete: _onDiscoveryComplete,
        ),
      routeDeviceSetupSelectDevicePage => SelectDevicePage(
          onDeviceSelected: _onDeviceSelected,
        ),
      routeDeviceSetupConnectingPage => WaitingPage(
          message: 'Connecting...',
          onWaitComplete: _onConnectionEstablished,
        ),
      routeDeviceSetupFinishedPage => FinishedPage(
          onFinishPressed: _exitSetup,
        ),
      _ => throw StateError('Unexpected route name: ${settings.name}!')
    };

    return MaterialPageRoute(
      builder: (context) {
        return page;
      },
      settings: settings,
    );
  }

  PreferredSizeWidget _buildFlowAppBar() {
    return AppBar(
      leading: IconButton(
        onPressed: _onExitPressed,
        icon: const Icon(Icons.chevron_left),
      ),
      title: const Text('Bulb Setup'),
    );
  }
}

class SelectDevicePage extends StatelessWidget {
  const SelectDevicePage({
    super.key,
    required this.onDeviceSelected,
  });

  final void Function(String deviceId) onDeviceSelected;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Select a nearby device:',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  style: ButtonStyle(
                    backgroundColor: WidgetStateColor.resolveWith((states) {
                      return const Color(0xFF222222);
                    }),
                  ),
                  onPressed: () {
                    onDeviceSelected('22n483nk5834');
                  },
                  child: const Text(
                    'Bulb 22n483nk5834',
                    style: TextStyle(
                      fontSize: 24,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class WaitingPage extends StatefulWidget {
  const WaitingPage({
    super.key,
    required this.message,
    required this.onWaitComplete,
  });

  final String message;
  final VoidCallback onWaitComplete;

  @override
  State<WaitingPage> createState() => _WaitingPageState();
}

class _WaitingPageState extends State<WaitingPage> {
  @override
  void initState() {
    super.initState();
    _startWaiting();
  }

  Future<void> _startWaiting() async {
    await Future<dynamic>.delayed(const Duration(seconds: 3));

    if (mounted) {
      widget.onWaitComplete();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 32),
              Text(widget.message),
            ],
          ),
        ),
      ),
    );
  }
}

class FinishedPage extends StatelessWidget {
  const FinishedPage({
    super.key,
    required this.onFinishPressed,
  });

  final VoidCallback onFinishPressed;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 250,
                height: 250,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFF222222),
                ),
                child: const Center(
                  child: Icon(
                    Icons.lightbulb,
                    size: 175,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                'Bulb added!',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                style: ButtonStyle(
                  padding: WidgetStateProperty.resolveWith((states) {
                    return const EdgeInsets.symmetric(
                        horizontal: 24, vertical: 12);
                  }),
                  backgroundColor: WidgetStateColor.resolveWith((states) {
                    return const Color(0xFF222222);
                  }),
                  shape: WidgetStateProperty.resolveWith((states) {
                    return const StadiumBorder();
                  }),
                ),
                onPressed: onFinishPressed,
                child: const Text(
                  'Finish',
                  style: TextStyle(
                    fontSize: 24,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

@immutable
class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  FlutterTts _flutterTts = FlutterTts();

  List<Map> _voices = [];

  Map? _currentVoice;

  int? _currentWordStart, _currentWordEnd;

  List _pecs = [
    {
      'category': 'Boas Maneiras',
      'icon': '',
      'collection': [
        {'text': 'Oi', 'image': 'url'},
        {'text': 'Tchau', 'image': 'url'},
        {'text': 'Tchau', 'image': 'url'},
        {'text': 'Tchau', 'image': 'url'},
        {'text': 'Tchau', 'image': 'url'},
        {'text': 'Tchau', 'image': 'url'},
        {'text': 'Tchau', 'image': 'url'},
      ]
    },
    {
      'category': 'Sentimentos',
      'icon': '',
      'collection': [
        {'text': 'Feliz', 'image': 'url'},
        {'text': 'Triste', 'image': 'url'},
      ]
    },
    {
      'category': 'Sentimentos',
      'icon': '',
      'collection': [
        {'text': 'Feliz', 'image': 'url'},
        {'text': 'Triste', 'image': 'url'},
      ]
    },
    {
      'category': 'Sentimentos',
      'icon': '',
      'collection': [
        {'text': 'Feliz', 'image': 'url'},
        {'text': 'Triste', 'image': 'url'},
      ]
    },
  ];

  @override
  void initState() {
    super.initState();
    initTTS();
  }

  void initTTS() {
    _flutterTts.setProgressHandler((text, start, end, word) {
      setState(() {
        _currentWordStart = start;
        _currentWordEnd = end;
      });
    });
    _flutterTts.getVoices.then((data) {
      try {
        _voices = List<Map>.from(data);
        setState(() {
          _voices = _voices
              .where((_voice) => _voice["locale"].contains("pt"))
              .toList();
          print(_voices);
          _currentVoice = _voices.first;
        });
      } catch (e) {
        print(e);
      }
    });
  }

  void setVoice(Map voice) {
    _flutterTts.setVoice({"name": voice["name"], "locale": voice["locale"]});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(context),
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Column(
          //   children: [
          //     DropdownButton(
          //       value: _currentVoice,
          //       items: _voices
          //           .map(
          //             (_voice) => DropdownMenuItem(
          //               value: _voice,
          //               child: Text(
          //                 _voice['name'],
          //               ),
          //             ),
          //           )
          //           .toList(),
          //       onChanged: (value) {
          //         print(value);
          //       },
          //     )
          //   ],
          // ),

          DefaultTabController(
              length: _pecs.length,
              child: Scaffold(
                appBar: TabBar(
                  isScrollable: true,
                  tabAlignment: TabAlignment.start,
                  padding: EdgeInsets.symmetric(
                    vertical: 0,
                    horizontal: 16,
                  ),
                  labelPadding: EdgeInsets.symmetric(
                    vertical: 0,
                    horizontal: 4,
                  ),
                  tabs: _pecs
                      .map(
                        (tab) => Tab(
                          child: Chip(
                            avatar: Container(
                              padding: EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(80),
                                color:
                                    Color(colorNeutralLight).withOpacity(0.60),
                              ),
                              child: Iconify(iconLearn),
                            ),
                            label: Text(tab['category'].toUpperCase()),
                            backgroundColor: Color(colorNeutral),
                            padding: EdgeInsets.fromLTRB(4, 4, 4, 4),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(24),
                            ),
                            side: BorderSide.none,
                            labelStyle: TextStyle(
                              color: Color(colorPrimary),
                              fontSize: 20.0,
                            ),
                          ),
                        ),
                      )
                      .toList(),
                ),
                body: TabBarView(
                  children: _pecs
                      .map((pecs) => Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: PecsList(
                                flutterTts: _flutterTts,
                                pecsCollection: pecs['collection']),
                          ))
                      .toList(),
                ),
              )),
          Positioned(
            bottom: 0,
            width: MediaQuery.of(context).size.width * 1,
            child: CustomNavBar(),
          )
        ],
      ),
      // floatingActionButton: FloatingActionButton(
      //   onPressed: () {
      //     _flutterTts.speak(TTS_INPUT);
      //     // Navigator.of(context).pushNamed(routeDeviceSetupStart);
      //   },
      //   child: const Icon(Icons.add),
      // ),
      // bottomNavigationBar: CustomNavBar(),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      toolbarHeight: 60,
      title: const Text('Pecs'),
      leading: IconButton(
        icon: const Iconify(iconConfig, size: 24),
        onPressed: () {
          Navigator.pushNamed(context, routeSettings);
        },
      ),
      actions: [
        Container(
          width: 32.0,
          height: 32.0,
          padding: EdgeInsets.all(2),
          margin: EdgeInsets.only(right: 20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            color: Color(colorNeutral),
          ),
          child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.asset('assets/images/avatar_default_v1.png')),
        )
      ],
    );
  }
}

class PecsList extends StatefulWidget {
  const PecsList({
    super.key,
    required FlutterTts flutterTts,
    required this.pecsCollection,
  }) : _flutterTts = flutterTts;

  final List pecsCollection;
  final FlutterTts _flutterTts;

  @override
  State<PecsList> createState() => _PecsListState();
}

class _PecsListState extends State<PecsList> {
  int? selectedIndex;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      childAspectRatio: (1 / 1.2),
      children: widget.pecsCollection
          .map(
            (pec) => GestureDetector(
              onTap: () {
                setState(() {
                  selectedIndex = widget.pecsCollection.indexOf(pec);
                });
                widget._flutterTts.speak(
                  pec['text'],
                );
                HapticFeedback.vibrate();
              },
              onDoubleTap: () {
                widget._flutterTts.stop();
              },
              child: Card(
                color: Colors.greenAccent.shade100,
                elevation: 0,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      AnimatedContainer(
                        duration: Duration(milliseconds: 600),
                        onEnd: () {
                          setState(() {
                            selectedIndex = null;
                          });
                        },
                        decoration: BoxDecoration(
                            boxShadow: [
                              BoxShadow(
                                color: Color(colorDark).withOpacity(0.16),
                                spreadRadius: 0,
                                blurRadius: 12,
                                offset: Offset(0, 4),
                              )
                            ],
                            borderRadius: BorderRadius.circular(80),
                            border: Border.all(
                              color: Color(colorNeutralLight).withOpacity(0.60),
                              width: selectedIndex ==
                                      widget.pecsCollection.indexOf(pec)
                                  ? 8
                                  : 0,
                              strokeAlign: BorderSide.strokeAlignOutside,
                            )),
                        child: CircleAvatar(
                          radius: 50,
                          backgroundImage:
                              AssetImage('assets/images/avatar_default_v2.png'),
                        ),
                      ),
                      Gap(12),
                      Container(
                        padding:
                            EdgeInsets.symmetric(vertical: 0, horizontal: 8),
                        decoration: BoxDecoration(
                          color: Color(colorNeutralLight).withOpacity(0.60),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          pec['text'],
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(),
      body: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(8, (index) {
            return Container(
              width: double.infinity,
              height: 54,
              margin: const EdgeInsets.only(left: 16, right: 16, top: 16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: const Color(0xFF222222),
              ),
            );
          }),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      title: const Text('Settings'),
    );
  }
}
