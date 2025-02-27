import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:gap/gap.dart';
import 'package:provider/provider.dart';
import 'package:sonora_kids/src/constants.dart';
import '/viewmodels/category_view_model.dart';
import '/src/appStyles.dart';

class CategoryTabs extends StatefulWidget {
  @override
  _CategoryTabsState createState() => _CategoryTabsState();
}

class _CategoryTabsState extends State<CategoryTabs>
    with TickerProviderStateMixin {
  final FlutterTts _flutterTts = FlutterTts();
  late TabController _tabController;

  @override
  Widget build(BuildContext context) {
    return Consumer<CategoryViewModel>(
      builder: (context, viewModel, child) {
        if (viewModel.isLoading) {
          return Center(child: CircularProgressIndicator());
        }

        List categories = viewModel.categories;
        void _onTabChanged() {
          if (!_tabController.indexIsChanging) {
            HapticFeedback.heavyImpact();
            var selectedPec = categories[_tabController.index];
            _flutterTts.speak(selectedPec['name']);
          }
        }

        _tabController = TabController(length: categories.length, vsync: this);
        _tabController.addListener(_onTabChanged);

        return DefaultTabController(
          length: categories.length,
          child: Scaffold(
            appBar: TabBar(
              controller: _tabController,
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
              tabs: categories.map((category) {
                String colorString = category['categoriasDePec']
                    ['configuracoesCategorias']['cor'];
                Color color = getColorFromString(colorString);
                String iconUrl = category['categoriasDePec']
                        ['configuracoesCategorias']['icone']['node']
                    ['mediaItemUrl'];

                return Tab(
                  child: Chip(
                    avatar: Container(
                      padding: EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(80),
                        color: Color(colorNeutralLight).withValues(alpha: 0.60),
                      ),
                      child: Image.network(iconUrl),
                    ),
                    label: Text(category['name'].toUpperCase()),
                    backgroundColor: color.withValues(alpha: 0.1),
                    padding: EdgeInsets.fromLTRB(4, 4, 4, 4),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                    side: BorderSide.none,
                    labelStyle: TextStyle(
                      color: color.withValues(alpha: 0.7),
                      fontSize: 20,
                      height: 0.8,
                      leadingDistribution: TextLeadingDistribution.even,
                    ),
                  ),
                );
              }).toList(),
            ),
            body: TabBarView(
              controller: _tabController,
              children: categories.map((category) {
                List pecsItems = category['pECS']['nodes'] ?? [];
                String colorString = category['categoriasDePec']
                    ['configuracoesCategorias']['cor'];
                Color color = getColorFromString(colorString);

                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: PecsList(
                    flutterTts: FlutterTts(),
                    pecsCollection: pecsItems,
                    pecsColor: color.withOpacity(0.1),
                  ),
                );
              }).toList(),
            ),
          ),
        );
      },
    );
  }
}

class PecsList extends StatefulWidget {
  const PecsList({
    super.key,
    required FlutterTts flutterTts,
    required this.pecsCollection,
    required this.pecsColor,
  }) : _flutterTts = flutterTts;

  final List pecsCollection;
  final Color pecsColor;
  final FlutterTts _flutterTts;

  @override
  State<PecsList> createState() => _PecsListState();
}

class _PecsListState extends State<PecsList> {
  int? selectedIndex;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      padding: EdgeInsets.fromLTRB(0, 0, 0, 120),
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
                  pec['title'],
                );
                HapticFeedback.vibrate();
              },
              onDoubleTap: () {
                widget._flutterTts.stop();
              },
              child: Card(
                color: widget.pecsColor,
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
                          backgroundImage: pec['featuredImage']?['node']
                                      ['sourceUrl'] !=
                                  null
                              ? NetworkImage(
                                  pec['featuredImage']?['node']['sourceUrl'])
                              : AssetImage('assets/placeholder.png')
                                  as ImageProvider,
                          onBackgroundImageError: (exception, stackTrace) {
                            print('Image loading error: $exception');
                          },
                        ),
                      ),
                      Gap(12),
                      Container(
                        padding:
                            EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                        decoration: BoxDecoration(
                          color: Color(colorNeutralLight).withOpacity(0.60),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          pec['title'],
                          // style: Theme.of(context).textTheme.titleMedium,
                          style: TextStyle(
                            fontSize: 24.0,
                            height: 0.8,
                          ),
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
