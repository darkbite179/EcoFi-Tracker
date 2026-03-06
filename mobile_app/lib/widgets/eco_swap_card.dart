import 'package:flutter/material.dart';
import '../constants.dart';

class EcoSwapCard extends StatelessWidget {
  final Map<String, dynamic> itemData;

  const EcoSwapCard({super.key, required this.itemData});

  @override
  Widget build(BuildContext context) {
    bool isGreen = itemData['isGreen'] ?? false;
    double itemCo2 = (itemData['co2'] ?? 0).toDouble();
    String? swapName = itemData['swap'];
    int leafReward = itemData['leafReward'] ?? 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderCard),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isGreen ? AppColors.greenDim : AppColors.bgBase,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isGreen ? Icons.eco : Icons.warning_amber_rounded,
                  color: isGreen ? AppColors.greenPrimary : AppColors.red,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      itemData['item'] ?? 'Unknown Item',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Text(
                          '${itemCo2.toStringAsFixed(2)} kg CO₂e',
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                        ),
                        const SizedBox(width: 8),
                        if (isGreen)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.greenDim,
                              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.greenPrimary.withAlpha(76)), // 0.3 opacity

                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.check, size: 12, color: AppColors.greenPrimary),
                                SizedBox(width: 4),
                                Text('Green choice', style: TextStyle(color: AppColors.greenPrimary, fontSize: 11)),
                              ],
                            ),
                          )
                        else
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.red.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.red.withOpacity(0.3)),
                            ),
                            child: const Text('High impact', style: TextStyle(color: AppColors.red, fontSize: 11)),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              if (leafReward > 0 && isGreen)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('+$leafReward', style: const TextStyle(color: AppColors.greenPrimary, fontWeight: FontWeight.bold, fontSize: 18)),
                    const Text('\$LEAF', style: TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                  ],
                )
            ],
          ),
          if (!isGreen && swapName != null && swapName.isNotEmpty) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.greenPrimary.withOpacity(0.05),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.greenPrimary.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.lightbulb_outline, color: AppColors.greenPrimary, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        RichText(
                          text: TextSpan(
                            style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                            children: [
                              const TextSpan(text: 'Swap to: ', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.greenPrimary)),
                              TextSpan(text: swapName),
                            ],
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.public, size: 12, color: Colors.blueAccent),
                            const SizedBox(width: 4),
                            Text('Save ${itemData['swapSavings']} kg CO₂e', style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                            const Spacer(),
                            if (leafReward > 0)
                              Text('+$leafReward \$LEAF', style: const TextStyle(color: AppColors.greenPrimary, fontWeight: FontWeight.bold, fontSize: 12)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ]
        ],
      ),
    );
  }
}
