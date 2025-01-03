import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'src/constants.dart';
import 'src/appStyles.dart';
import 'src/screens/HomeScreen.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';

void main() {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
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
              foregroundColor: Color(colorPrimary),
              backgroundColor: Color(colorLight),
              overlayColor: Color(colorPrimary),
              textStyle: TextStyle(
                fontSize: 28,
                fontFamily: 'Dongle',
              ),
              padding: EdgeInsets.symmetric(
                vertical: 16.0,
                horizontal: 16.0,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16.0),
              ),
            ),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              foregroundColor: Color(colorNeutralLight),
              backgroundColor: Color(colorPrimary),
              textStyle: TextStyle(
                fontSize: 28,
                fontFamily: 'Dongle',
              ),
              padding: EdgeInsets.symmetric(
                vertical: 16.0,
                horizontal: 16.0,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16.0),
              ),
            ),
          ),
          outlinedButtonTheme: OutlinedButtonThemeData(
            style: OutlinedButton.styleFrom(
              foregroundColor: Color(colorPrimary),
              surfaceTintColor: Color(colorPrimary),
              textStyle: TextStyle(
                fontSize: 28,
                fontFamily: 'Dongle',
              ),
              padding: EdgeInsets.symmetric(
                vertical: 16.0,
                horizontal: 16.0,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16.0),
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
      // darkTheme: ThemeData.dark(),
      onGenerateRoute: (settings) {
        late Widget page;
        if (settings.name == routeHome) {
          page = const HomeScreen();
          FlutterNativeSplash.remove();
        } else if (settings.name == routeProfile) {
          page = const ProfileScreen();
        } else if (settings.name == routeSettings) {
          page = const SettingsScreen();
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
class SettingsScreen extends StatelessWidget {
  const SettingsScreen({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: _buildAppBar(),
        body: Stack(
          fit: StackFit.expand,
          children: [
            SingleChildScrollView(
              clipBehavior: Clip.hardEdge,
              padding: EdgeInsets.only(bottom: 80),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: List.generate(20, (index) {
                  return ListTile(
                    onTap: () {},
                    splashColor: Color(colorNeutral),
                    contentPadding:
                        EdgeInsets.symmetric(vertical: 12, horizontal: 20),
                    title: Text(
                      '$index index',
                      style: TextStyle(
                        fontSize: 24,
                      ),
                    ),
                    trailing: Icon(
                      Icons.arrow_forward_rounded,
                      color: Color(colorNeutralDark),
                      size: 24,
                    ),
                    shape: Border(
                      bottom: BorderSide(
                        color: Color(colorNeutral),
                      ),
                    ),
                  );
                }),
              ),
            ),
            Positioned(
              bottom: 0,
              width: MediaQuery.of(context).size.width * 1,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
                color: Color(colorNeutralLight),
                child: Text(
                  'App Versão 1.0',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 20,
                    color: Color(colorNeutralDark),
                  ),
                ),
              ),
            ),
          ],
        ));
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      title: const Text('Configurações'),
    );
  }
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: _buildAppBar(),
        body: Stack(
          fit: StackFit.expand,
          children: [
            SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              child: Column(
                mainAxisSize: MainAxisSize.max,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 80.0,
                      height: 80.0,
                      padding: EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        color: Color(colorNeutral),
                      ),
                      child: ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Image.asset(
                              'assets/images/avatar_default_v1.png')),
                    ),
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  Column(
                    children: [
                      Text(
                        'User Name',
                        style: TextStyle(
                          fontSize: 28,
                          height: 0.8,
                          leadingDistribution: TextLeadingDistribution.even,
                          color: Color(colorPrimary),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'João Roberto Pereira da Silva',
                        style: TextStyle(
                          fontSize: 20,
                          height: 0.8,
                          leadingDistribution: TextLeadingDistribution.even,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        gradient: LinearGradient(colors: [
                          Color(colorPrimary),
                          Color(colorPrimaryDark)
                        ])),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Palavras mais usadas',
                          style: TextStyle(
                              color: Color(colorNeutralLight),
                              fontSize: 28,
                              fontWeight: FontWeight.bold),
                        ),
                        Wrap(
                          spacing: 4,
                          runSpacing: -12,
                          children: List.generate(
                            8,
                            (index) {
                              return Chip(
                                avatar: CircleAvatar(
                                  backgroundColor: Color(colorLight),
                                  radius: 16,
                                  child: Text(
                                    (index + 1).toString(),
                                    style: TextStyle(
                                        height: 1.3,
                                        fontSize: 20,
                                        color: Color(colorPrimary)),
                                  ),
                                ),
                                label: Text('${index}hello'.toUpperCase()),
                                backgroundColor: Color(colorNeutral),
                                padding: EdgeInsets.fromLTRB(4, 4, 4, 4),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                side: BorderSide.none,
                                labelStyle: TextStyle(
                                  color: Color(colorDark),
                                  fontSize: 20,
                                  height: 0.8,
                                  leadingDistribution:
                                      TextLeadingDistribution.even,
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
            Positioned(
              bottom: 0,
              width: MediaQuery.of(context).size.width * 1,
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: TextButton(
                    onPressed: () {},
                    child: Text('Editar Perfil'),
                  ),
                ),
              ),
            ),
          ],
        ));
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      title: const Text('Perfil'),
    );
  }
}
