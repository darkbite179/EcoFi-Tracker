import 'package:flutter/material.dart';

class AppColors {
  static const Color bgBase = Color(0xFF080D08);
  static const Color bgCard = Color(0x0AFFFFFF); // rgba(255, 255, 255, 0.04)
  static const Color borderCard = Color(0x14FFFFFF); // rgba(255, 255, 255, 0.08)
  static const Color greenPrimary = Color(0xFF14D214);
  static const Color greenGlow = Color(0x4014D214); // rgba(20, 210, 20, 0.25)
  static const Color greenDim = Color(0x1414D214); // rgba(20, 210, 20, 0.08)
  static const Color textPrimary = Color(0xFFF0F4F0);
  static const Color textSecondary = Color(0xFF8A9E8A);
  static const Color textMuted = Color(0xFF4A5E4A);
  static const Color red = Color(0xFFEF4444);
}

class AppConstants {
  static const String backendUrl = "http://10.0.2.2:3001"; // Android emulator localhost

  static const Map<String, dynamic> mockResults = {
    'high_carbon': {
      'totalCO2': 32.4,
      'vsAverage': 18.4,
      'greenScore': 12,
      'leafReward': 0,
      'items': [
        {
          'item': "Beef Mince 1kg",
          'co2': 27.0,
          'isGreen': false,
          'swap': "Chicken or Lentils",
          'swapSavings': 20.1,
          'leafReward': 40
        },
        {
          'item': "Cheddar Cheese 500g",
          'co2': 6.75,
          'isGreen': false,
          'swap': "Tofu (reduced-fat)",
          'swapSavings': 4.3,
          'leafReward': 10
        },
        {
          'item': "Whole Milk 2L",
          'co2': 6.4,
          'isGreen': false,
          'swap': "Oat Milk (Brand B)",
          'swapSavings': 4.6,
          'leafReward': 15
        },
        {
          'item': "Lamb Chops 800g",
          'co2': 20.8,
          'isGreen': false,
          'swap': "Chicken or Lentils",
          'swapSavings': 15.3,
          'leafReward': 40
        },
        {
          'item': "Chocolate Bar 200g",
          'co2': 3.74,
          'isGreen': false,
          'swap': null,
          'swapSavings': 0,
          'leafReward': 0
        }
      ]
    },
    'average': {
      'totalCO2': 14.2,
      'vsAverage': 0.2,
      'greenScore': 450,
      'leafReward': 5,
      'items': [
        {
          'item': "Chicken Breast 1kg",
          'co2': 6.9,
          'isGreen': true,
          'swap': null,
          'swapSavings': 0,
          'leafReward': 5
        },
        {
          'item': "Eggs (Dozen)",
          'co2': 2.6,
          'isGreen': true,
          'swap': null,
          'swapSavings': 0,
          'leafReward': 0
        },
        {
          'item': "Pasta 500g",
          'co2': 0.6,
          'isGreen': true,
          'swap': null,
          'swapSavings': 0,
          'leafReward': 0
        },
        {
          'item': "Tomatoes 1kg",
          'co2': 1.4,
          'isGreen': true,
          'swap': null,
          'swapSavings': 0,
          'leafReward': 0
        }
      ]
    },
    'green': {
      'totalCO2': 4.3,
      'vsAverage': -9.7,
      'greenScore': 890,
      'leafReward': 60,
      'waterSaved': 14550,
      'items': [
        {
          'item': "Oat Milk 1L (Brand B)",
          'co2': 0.9,
          'isGreen': true,
          'swap': null,
          'swapSavings': 0,
          'leafReward': 15
        },
        {
          'item': "Organic Lentils 500g",
          'co2': 0.45,
          'isGreen': true,
          'swap': null,
          'swapSavings': 0,
          'leafReward': 20
        },
        {
          'item': "Local Apples 1kg",
          'co2': 0.4,
          'isGreen': true,
          'swap': null,
          'swapSavings': 0,
          'leafReward': 10
        },
        {
          'item': "Organic Tofu 400g",
          'co2': 1.2,
          'isGreen': true,
          'swap': null,
          'swapSavings': 0,
          'leafReward': 10
        },
        {
          'item': "Sourdough Bread 400g",
          'co2': 0.56,
          'isGreen': true,
          'swap': null,
          'swapSavings': 0,
          'leafReward': 5
        }
      ]
    }
  };
}
