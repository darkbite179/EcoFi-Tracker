import 'package:flutter/material.dart';
import '../constants.dart';

class TokenBanner extends StatefulWidget {
  final int leafAmount;
  final VoidCallback onClaim;

  const TokenBanner({super.key, required this.leafAmount, required this.onClaim});

  @override
  State<TokenBanner> createState() => _TokenBannerState();
}

class _TokenBannerState extends State<TokenBanner> with SingleTickerProviderStateMixin {
  late AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.leafAmount == 0) return const SizedBox.shrink();

    return AnimatedBuilder(
      animation: _animController,
      builder: (context, child) {
        return Container(
          margin: const EdgeInsets.symmetric(vertical: 20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.greenPrimary.withOpacity(0.3)),
            gradient: LinearGradient(
              colors: [
                AppColors.greenPrimary.withOpacity(0.15),
                AppColors.greenPrimary.withOpacity(0.05),
              ],
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.greenPrimary.withOpacity(0.1 + (_animController.value * 0.1)),
                blurRadius: 20 + (_animController.value * 20),
                spreadRadius: _animController.value * 5,
              )
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Row(
              children: [
                const Icon(Icons.eco, color: AppColors.greenPrimary, size: 40),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '+${widget.leafAmount} \$LEAF',
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: AppColors.greenPrimary,
                          shadows: [Shadow(color: AppColors.greenPrimary, blurRadius: 10)],
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'You earned rewards for saving the planet',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: widget.onClaim,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.greenPrimary,
                    foregroundColor: AppColors.bgBase,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  child: const Text('Claim'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
