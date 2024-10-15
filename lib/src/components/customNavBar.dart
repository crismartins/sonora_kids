import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../appStyles.dart';
import '../constants.dart';
import 'package:iconify_flutter/iconify_flutter.dart';

class CustomNavBar extends StatelessWidget {
  const CustomNavBar({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        height: 80,
        margin: EdgeInsets.all(24.0),
        decoration: BoxDecoration(
          color: Color(colorNeutralLight).withOpacity(0.98),
          borderRadius: BorderRadius.circular(68),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(68),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 40.0, sigmaY: 40.0),
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: bottomNav
                    .map((item) => Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(68),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Iconify(
                                item['icon'],
                                color: Color(colorNeutralDark),
                              ),
                              Text(
                                item['title'].toUpperCase(),
                                style: TextStyle(
                                  color: Color(colorNeutralDark),
                                ),
                              ),
                            ],
                          ),
                        ))
                    .toList(),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
