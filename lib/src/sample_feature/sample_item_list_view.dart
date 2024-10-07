import 'package:flutter/material.dart';

import '../settings/settings_view.dart';
import 'sample_item.dart';
import 'package:iconify_flutter/iconify_flutter.dart';

const String config =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path opacity="0.5" fill-rule="evenodd" clip-rule="evenodd" d="M14.279 2.152C13.909 2 13.439 2 12.5 2C11.561 2 11.092 2 10.721 2.152C10.4769 2.25175 10.2549 2.39878 10.0678 2.58465C9.88077 2.77051 9.73231 2.99154 9.63099 3.235C9.53699 3.458 9.501 3.719 9.486 4.098C9.47886 4.3725 9.40206 4.64068 9.26282 4.87736C9.12358 5.11403 8.92647 5.31142 8.68999 5.451C8.44874 5.5851 8.17754 5.65615 7.90152 5.65754C7.6255 5.65894 7.3536 5.59065 7.111 5.459C6.773 5.281 6.528 5.183 6.286 5.151C5.75658 5.08192 5.22126 5.2242 4.796 5.547C4.478 5.789 4.243 6.193 3.774 7C3.304 7.807 3.07 8.21 3.017 8.605C2.947 9.131 3.091 9.663 3.417 10.084C3.565 10.276 3.774 10.437 4.097 10.639C4.574 10.936 4.88 11.442 4.88 12C4.88 12.558 4.574 13.064 4.098 13.36C3.774 13.563 3.56499 13.724 3.416 13.916C3.25556 14.1242 3.13774 14.362 3.06928 14.6158C3.00082 14.8696 2.98305 15.1343 3.017 15.395C3.07 15.789 3.304 16.193 3.774 17C4.244 17.807 4.478 18.21 4.796 18.453C5.22 18.776 5.756 18.918 6.286 18.849C6.528 18.817 6.773 18.719 7.111 18.541C7.35372 18.4092 7.62581 18.3408 7.90202 18.3422C8.17823 18.3436 8.44962 18.4147 8.691 18.549C9.177 18.829 9.465 19.344 9.486 19.902C9.501 20.282 9.53699 20.542 9.63099 20.765C9.83499 21.255 10.227 21.645 10.721 21.848C11.091 22 11.561 22 12.5 22C13.439 22 13.909 22 14.279 21.848C14.5231 21.7483 14.7451 21.6012 14.9321 21.4154C15.1192 21.2295 15.2677 21.0085 15.369 20.765C15.463 20.542 15.499 20.282 15.514 19.902C15.534 19.344 15.823 18.828 16.31 18.549C16.5513 18.4149 16.8225 18.3439 17.0985 18.3425C17.3745 18.3411 17.6464 18.4093 17.889 18.541C18.227 18.719 18.472 18.817 18.714 18.849C19.244 18.919 19.78 18.776 20.204 18.453C20.522 18.211 20.757 17.807 21.226 17C21.696 16.193 21.93 15.79 21.983 15.395C22.0168 15.1343 21.9989 14.8695 21.9302 14.6157C21.8616 14.3619 21.7436 14.1241 21.583 13.916C21.435 13.724 21.226 13.563 20.903 13.361C20.426 13.064 20.12 12.558 20.12 12C20.12 11.442 20.426 10.936 20.902 10.64C21.226 10.437 21.435 10.276 21.584 10.084C21.7444 9.87579 21.8622 9.63799 21.9307 9.38422C21.9992 9.13044 22.0169 8.86565 21.983 8.605C21.93 8.211 21.696 7.807 21.226 7C20.756 6.193 20.522 5.79 20.204 5.547C19.7787 5.2242 19.2434 5.08192 18.714 5.151C18.472 5.183 18.227 5.281 17.889 5.459C17.6463 5.59083 17.3742 5.65922 17.098 5.65782C16.8218 5.65642 16.5504 5.58528 16.309 5.451C16.0727 5.3113 15.8758 5.11385 15.7367 4.87719C15.5977 4.64052 15.521 4.37241 15.514 4.098C15.499 3.718 15.463 3.458 15.369 3.235C15.2677 2.99154 15.1192 2.77051 14.9321 2.58465C14.7451 2.39878 14.5231 2.25175 14.279 2.152Z" fill="#89ACC7"/><path d="M15.523 12C15.523 13.657 14.169 15 12.5 15C10.831 15 9.47701 13.657 9.47701 12C9.47701 10.343 10.83 9 12.5 9C14.17 9 15.523 10.343 15.523 12Z" fill="#89ACC7"/></svg>';

void main() => runApp(const NavigationBarApp());

class NavigationBarApp extends StatelessWidget {
  const NavigationBarApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(useMaterial3: true),
      home: const NavigationExample(),
    );
  }
}

abstract class SampleItemListView extends StatelessWidget {
  const SampleItemListView({
    super.key,
    this.items = const [SampleItem(1), SampleItem(2), SampleItem(3)],
  });

  static const routeName = '/';

  final List<SampleItem> items;
}

class NavigationExample extends StatefulWidget {
  const NavigationExample({super.key});

  @override
  State<NavigationExample> createState() => _NavigationExampleState();
}

/// Displays a list of SampleItems.
class _NavigationExampleState extends State<NavigationExample> {
  int currentPageIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 60,
        leading: IconButton(
          icon: const Iconify(config, size: 24),
          onPressed: () {
            // Navigate to the settings page. If the user leaves and returns
            // to the app after it has been killed while running in the
            // background, the navigation stack is restored.
            Navigator.restorablePushNamed(context, SettingsView.routeName);
          },
        ),
        title: Text('Pecs'),
        centerTitle: true,
        actions: [
          CircleAvatar(
            // radius: 12,
            foregroundImage: AssetImage('assets/images/flutter_logo.png'),
            // child: Image.network(
            //     'https://s2-techtudo.glbimg.com/zAVzm6CbZ6VSmpDe76jhK7Qx73E=/0x0:1200x700/888x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_08fbf48bc0524877943fe86e43087e7a/internal_photos/bs/2023/u/G/eQpsXGQB6xTlFlvJsUOw/avatar-a-lenda-de-aang.jpg',
            //     width: 32,
            //     height: 32),
          )
        ],
      ),
      bottomNavigationBar: NavigationBar(
        onDestinationSelected: (int index) {
          setState(() {
            currentPageIndex = index;
          });
        },
        indicatorColor: Colors.amber,
        selectedIndex: currentPageIndex,
        destinations: const <Widget>[
          NavigationDestination(
            selectedIcon: Icon(Icons.image_outlined),
            icon: Icon(Icons.home_outlined),
            label: 'PECS',
          ),
          NavigationDestination(
            icon: Icon(Icons.layers_outlined),
            label: 'FRASES',
          ),
          NavigationDestination(
            icon: Icon(Icons.cast_for_education_rounded),
            label: 'APRENDER',
          ),
          NavigationDestination(
            icon: Icon(Icons.timer_outlined),
            label: 'ROTINA',
          ),
        ],
      ),
      body: <Widget>[
        /// Home page
        Card(
          shadowColor: Colors.transparent,
          margin: const EdgeInsets.all(8.0),
          child: SizedBox.expand(
            child: Center(
              child: Text(
                'Home page',
              ),
            ),
          ),
        ),

        /// Notifications page
        const Padding(
          padding: EdgeInsets.all(8.0),
          child: Column(
            children: <Widget>[
              Card(
                child: ListTile(
                  leading: Icon(Icons.notifications_sharp),
                  title: Text('Notification 1'),
                  subtitle: Text('This is a notification'),
                ),
              ),
              Card(
                child: ListTile(
                  leading: Icon(Icons.notifications_sharp),
                  title: Text('Notification 2'),
                  subtitle: Text('This is a notification'),
                ),
              ),
            ],
          ),
        ),

        /// Messages page
        ListView.builder(
          reverse: true,
          itemCount: 2,
          itemBuilder: (BuildContext context, int index) {
            if (index == 0) {
              return Align(
                alignment: Alignment.centerRight,
                child: Container(
                  margin: const EdgeInsets.all(8.0),
                  padding: const EdgeInsets.all(8.0),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  child: Text(
                    'Hello',
                  ),
                ),
              );
            }
            return Align(
              alignment: Alignment.centerLeft,
              child: Container(
                margin: const EdgeInsets.all(8.0),
                padding: const EdgeInsets.all(8.0),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: Text(
                  'Hi!',
                ),
              ),
            );
          },
        ),
      ][currentPageIndex],
      // To work with lists that may contain a large number of items, it’s best
      // to use the ListView.builder constructor.
      //
      // In contrast to the default ListView constructor, which requires
      // building all Widgets up front, the ListView.builder constructor lazily
      // builds Widgets as they’re scrolled into view.
      //   const SampleItemListView({
      //     super.key,
      //     this.items = const [SampleItem(1), SampleItem(2), SampleItem(3)],
      //   });
      //
      //   static const routeName = '/';
      //
      //   final List<SampleItem> items;
      // body: ListView.builder(
      //   // Providing a restorationId allows the ListView to restore the
      //   // scroll position when a user leaves and returns to the app after it
      //   // has been killed while running in the background.
      //   restorationId: 'sampleItemListView',
      //   itemCount: items.length,
      //   itemBuilder: (BuildContext context, int index) {
      //     final item = items[index];
      //
      //     return ListTile(
      //         title: Text('SampleItem ${item.id}'),
      //         leading: const CircleAvatar(
      //           // Display the Flutter Logo image asset.
      //           foregroundImage: AssetImage('assets/images/flutter_logo.png'),
      //         ),
      //         onTap: () {
      //           // Navigate to the details page. If the user leaves and returns to
      //           // the app after it has been killed while running in the
      //           // background, the navigation stack is restored.
      //           Navigator.restorablePushNamed(
      //             context,
      //             SampleItemDetailsView.routeName,
      //           );
      //         });
      //   },
      // ),
    );
  }
}
