import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:sonora_kids/src/appStyles.dart';

import 'sample_feature/sample_item_details_view.dart';
import 'sample_feature/sample_item_list_view.dart';
import 'settings/settings_controller.dart';
import 'settings/settings_view.dart';

/// The Widget that configures your application.
class MyApp extends StatelessWidget {
  const MyApp({
    super.key,
    required this.settingsController,
  });

  final SettingsController settingsController;

  @override
  Widget build(BuildContext context) {
    // Glue the SettingsController to the MaterialApp.
    //
    // The ListenableBuilder Widget listens to the SettingsController for changes.
    // Whenever the user updates their settings, the MaterialApp is rebuilt.
    return ListenableBuilder(
      listenable: settingsController,
      builder: (BuildContext context, Widget? child) {
        return MaterialApp(
          // Providing a restorationScopeId allows the Navigator built by the
          // MaterialApp to restore the navigation stack when a user leaves and
          // returns to the app after it has been killed while running in the
          // background.
          restorationScopeId: 'app',

          // Provide the generated AppLocalizations to the MaterialApp. This
          // allows descendant Widgets to display the correct translations
          // depending on the user's locale.
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('pt', 'br'), // English, no country code
          ],

          // Use AppLocalizations to configure the correct application title
          // depending on the user's locale.
          //
          // The appTitle is defined in .arb files found in the localization
          // directory.
          onGenerateTitle: (BuildContext context) =>
              AppLocalizations.of(context)!.appTitle,

          // Define a light and dark color theme. Then, read the user's
          // preferred ThemeMode (light, dark, or system default) from the
          // SettingsController to display the correct theme.
          theme: ThemeData(
              useMaterial3: true,
              fontFamily: 'Dongle',
              textTheme: TextTheme(
                titleLarge: TextStyle(
                  fontSize: 28.0,
                ),
                bodySmall: TextStyle(fontSize: 14.0),
                bodyMedium: TextStyle(fontSize: 16.0),
                bodyLarge: TextStyle(fontSize: 20.0),
                labelSmall: TextStyle(fontSize: 12.0),
                labelMedium: TextStyle(fontSize: 14.0),
                labelLarge: TextStyle(
                  fontSize: 16.0,
                  fontWeight: FontWeight.w400,
                ),
              ),
              tabBarTheme: TabBarTheme(
                labelColor: Color(colorDark),
                dividerColor: Colors.transparent,
                labelStyle: TextStyle(
                  fontSize: 14.0,
                  fontWeight: FontWeight.w400,
                ),
                unselectedLabelStyle: TextStyle(
                  fontSize: 14.0,
                  color: Color(colorDark),
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
                  backgroundColor: Colors.amber,
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
                iconTheme: IconThemeData(color: Color(colorPrimary)),
                color: Color(colorDark),
                scrolledUnderElevation: 0.0,
                elevation: 0,
              ),
              chipTheme: ChipThemeData(
                labelStyle: TextStyle(fontSize: 20.0),
              ),
              navigationBarTheme: NavigationBarThemeData(
                backgroundColor: Colors.transparent,
              )),
          // darkTheme: ThemeData.dark(),
          themeMode: settingsController.themeMode,

          // Define a function to handle named routes in order to support
          // Flutter web url navigation and deep linking.
          onGenerateRoute: (RouteSettings routeSettings) {
            return MaterialPageRoute<void>(
              settings: routeSettings,
              builder: (BuildContext context) {
                switch (routeSettings.name) {
                  case SettingsView.routeName:
                    return SettingsView(controller: settingsController);
                  case SampleItemDetailsView.routeName:
                    return const SampleItemDetailsView();
                  case SampleItemListView.routeName:
                  default:
                    return const NavigationExample();
                }
              },
            );
          },
        );
      },
    );
  }
}
