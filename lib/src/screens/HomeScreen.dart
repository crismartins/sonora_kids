import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:sonora_kids/src/components/categoryTabs.dart';
import '/src/constants.dart';
import '/src/appStyles.dart';
import 'package:iconify_flutter/iconify_flutter.dart';
import '/src/appIcons.dart';
import 'dart:ui';

@immutable
class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  final FlutterTts _flutterTts = FlutterTts();
  late TabController _phrasesTabController;

  List<Map> _voices = [];

  Map? _currentVoice;

  int? _currentWordStart, _currentWordEnd;

  int _selectedIndex = 0;

  var appBarTitle = Text("Pecs");

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;

      var selectedMenu = bottomNav[_selectedIndex];
      appBarTitle = Text(selectedMenu['title']);
      _flutterTts.speak(selectedMenu['title']);
      HapticFeedback.heavyImpact();
    });
  }

  @override
  void initState() {
    super.initState();
    initTTS();

    _phrasesTabController = TabController(length: phrases.length, vsync: this);
    _phrasesTabController.addListener(_onPhrasesTabChanged);
  }

  void _onPhrasesTabChanged() {
    if (!_phrasesTabController.indexIsChanging) {
      HapticFeedback.heavyImpact();
      var selectedPec = phrases[_phrasesTabController.index];
      _flutterTts
          .speak(selectedPec['category']); // Speak the selected tab category
    }
  }

  @override
  void dispose() {
    _flutterTts.stop();
    _phrasesTabController.dispose(); // Dispose of TabController
    super.dispose();
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
          _voices =
              _voices.where((voice) => voice["locale"].contains("pt")).toList();
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
          Container(
            child: _widgetOptions().elementAt(_selectedIndex),
          ),
          Positioned(
            bottom: 0,
            width: MediaQuery.of(context).size.width * 1,
            child: SafeArea(
              child: Container(
                height: 80,
                margin: EdgeInsets.symmetric(horizontal: 24.0, vertical: 12),
                decoration: BoxDecoration(
                  color: Color(colorNeutralLight).withOpacity(0.98),
                  borderRadius: BorderRadius.circular(68),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(68),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 40.0, sigmaY: 40.0),
                    // blendMode: BlendMode.multiply,
                    child: BottomNavigationBar(
                      backgroundColor: Colors.transparent,
                      type: BottomNavigationBarType.fixed,
                      elevation: 0,
                      selectedFontSize: 16.0,
                      unselectedFontSize: 16.0,
                      items: bottomNav
                          .map(
                            (item) => BottomNavigationBarItem(
                              icon: Iconify(
                                item['icon'],
                                color: Color(colorNeutralDark),
                              ),
                              activeIcon: Iconify(
                                item['icon'],
                                color: Color(colorPrimary),
                              ),
                              label: item['title'].toUpperCase(),
                              backgroundColor: Colors.transparent,
                            ),
                          )
                          .toList(),
                      currentIndex: _selectedIndex,
                      selectedItemColor: Color(colorPrimary),
                      unselectedItemColor: Color(colorNeutralDark),
                      onTap: _onItemTapped,
                    ),
                  ),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  List<Widget> _widgetOptions() => <Widget>[
        CategoryTabs(),
        Scaffold(
          appBar: TabBar(
            controller: _phrasesTabController,
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
            tabs: phrases
                .map(
                  (tab) => Tab(
                    child: Chip(
                      label: Text(tab['category'].toUpperCase()),
                      backgroundColor: Color(colorNeutral),
                      padding: EdgeInsets.fromLTRB(4, 4, 4, 4),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                      side: BorderSide.none,
                      labelStyle: TextStyle(
                        color: Color(colorPrimary),
                        fontSize: 20,
                        height: 0.8,
                        leadingDistribution: TextLeadingDistribution.even,
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
          body: TabBarView(
            controller: _phrasesTabController,
            children: phrases
                .map((phrases) => Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: PhrasesList(
                        flutterTts: FlutterTts(),
                        phrasesCollection: phrases['collection'],
                      ),
                    ))
                .toList(),
          ),
        ),
        SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  gradient: LinearGradient(
                      colors: [Color(colorPrimary), Color(colorPrimaryDark)])),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    'Aprenda Jogando',
                    style: TextStyle(
                        color: Color(colorNeutralLight),
                        fontSize: 28,
                        fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
        ),
        Scaffold(
          appBar: TabBar(
            controller: _phrasesTabController,
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
            tabs: phrases
                .map(
                  (tab) => Tab(
                    child: Chip(
                      label: Text(tab['category'].toUpperCase()),
                      backgroundColor: Color(colorNeutral),
                      padding: EdgeInsets.fromLTRB(4, 4, 4, 4),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                      side: BorderSide.none,
                      labelStyle: TextStyle(
                        color: Color(colorPrimary),
                        fontSize: 20,
                        height: 0.8,
                        leadingDistribution: TextLeadingDistribution.even,
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
          body: TabBarView(
            controller: _phrasesTabController,
            children: phrases
                .map((phrases) => Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: PhrasesList(
                        flutterTts: FlutterTts(),
                        phrasesCollection: phrases['collection'],
                      ),
                    ))
                .toList(),
          ),
        ),
      ];

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      toolbarHeight: 60,
      title: appBarTitle,
      leading: IconButton(
        icon: const Iconify(iconConfig, size: 24),
        onPressed: () {
          Navigator.pushNamed(context, routeSettings);
          // widget._flutterTts.speak(
          //   'Config',
          // );
        },
      ),
      actions: [
        GestureDetector(
          onTap: () {
            Navigator.pushNamed(context, routeProfile);
          },
          child: Container(
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
          ),
        )
      ],
    );
  }
}

class PhrasesList extends StatefulWidget {
  const PhrasesList({
    super.key,
    required FlutterTts flutterTts,
    required this.phrasesCollection,
  }) : _flutterTts = flutterTts;

  final List phrasesCollection;
  final FlutterTts _flutterTts;

  @override
  State<PhrasesList> createState() => _PhrasesListState();
}

class _PhrasesListState extends State<PhrasesList> {
  int? selectedPhrase;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.fromLTRB(0, 0, 0, 120),
      children: widget.phrasesCollection
          .map(
            (pecs) => GestureDetector(
              onTap: () {
                var phrase = pecs.map((item) => '${item['text']} ');
                setState(() {
                  selectedPhrase = widget.phrasesCollection.indexOf(pecs);
                });
                widget._flutterTts.speak(phrase.join());
                HapticFeedback.vibrate();
              },
              onDoubleTap: () {
                widget._flutterTts.stop();
              },
              child: AnimatedContainer(
                duration: Duration(milliseconds: 600),
                onEnd: () {
                  setState(() {
                    selectedPhrase = null;
                  });
                },
                child: Card(
                  clipBehavior: Clip.hardEdge,
                  color:
                      selectedPhrase == widget.phrasesCollection.indexOf(pecs)
                          ? Color(colorNeutral)
                          : Color(colorNeutral),
                  shadowColor: Color(colorPrimaryLight),
                  elevation:
                      selectedPhrase == widget.phrasesCollection.indexOf(pecs)
                          ? 4
                          : 0,
                  child: Row(
                    children: [
                      Expanded(
                        child: Flex(
                          direction: Axis.horizontal,
                          // mainAxisAlignment: MainAxisAlignment.center,
                          children: pecs.map<Widget>((item) {
                            var itemIndex = pecs.length - pecs.indexOf(item);
                            return Expanded(
                              child: Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(4.0),
                                  gradient: LinearGradient(colors: [
                                    Colors.cyan.shade100.withOpacity(0),
                                    item['color'].shade100,
                                  ]),
                                  border: Border(
                                    right: BorderSide(
                                        color: Color(colorDark), width: 2),
                                  ),
                                ),
                                padding: const EdgeInsets.all(12.0),
                                child: Stack(
                                  clipBehavior: Clip.none,
                                  alignment: Alignment.center,
                                  children: [
                                    Positioned(
                                      top: 24,
                                      right: -22,
                                      child: Container(
                                        width: 10,
                                        height: 20,
                                        decoration: BoxDecoration(
                                          color: item['color'].shade100,
                                          borderRadius:
                                              BorderRadius.circular(12.0),
                                          border: Border(
                                            right: BorderSide(
                                                color: Color(colorDark),
                                                width: 2),
                                            top: BorderSide(
                                                color: Color(colorDark),
                                                width: 2),
                                            bottom: BorderSide(
                                                color: Color(colorDark),
                                                width: 2),
                                          ),
                                        ),
                                      ),
                                    ),
                                    Column(
                                      children: [
                                        CircleAvatar(
                                          radius: 20,
                                          backgroundImage:
                                              AssetImage(item['image']),
                                        ),
                                        Text(
                                          item['text'],
                                          style: TextStyle(
                                              fontSize: 20,
                                              color: Color(colorDark)),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(
                            vertical: 16.0, horizontal: 24.0),
                        child: Iconify(
                          iconSound,
                          size: 24,
                          color: Color(colorPrimary),
                        ),
                      )
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
