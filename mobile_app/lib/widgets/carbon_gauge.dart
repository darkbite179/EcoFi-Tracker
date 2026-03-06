import 'package:flutter/material.dart';
import 'dart:math';
import '../constants.dart';

class CarbonGauge extends StatefulWidget {
  final double score;

  const CarbonGauge({super.key, required this.score});

  @override
  State<CarbonGauge> createState() => _CarbonGaugeState();
}

class _CarbonGaugeState extends State<CarbonGauge> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 1));
    _animation = Tween<double>(begin: 0, end: widget.score).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));
    _controller.forward();
  }

  @override
  void didUpdateWidget(covariant CarbonGauge oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.score != widget.score) {
      _animation = Tween<double>(begin: oldWidget.score, end: widget.score).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));
      _controller.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Color get _gaugeColor {
    if (widget.score < 10) return AppColors.greenPrimary;
    if (widget.score < 20) return Colors.amber;
    return AppColors.red;
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return CustomPaint(
          size: const Size(200, 100),
          painter: ArcPainter(_animation.value, _gaugeColor),
          child: SizedBox(
            width: 200,
            height: 100,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  _animation.value.toStringAsFixed(1),
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: _gaugeColor,
                  ),
                ),
                const Text(
                  'kg CO₂e',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class ArcPainter extends CustomPainter {
  final double score;
  final Color color;
  final double maxScore = 40.0;

  ArcPainter(this.score, this.color);

  @override
  void paint(Canvas canvas, Size size) {
    var paintBg = Paint()
      ..color = AppColors.borderCard
      ..strokeWidth = 14
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    var paintFg = Paint()
      ..color = color
      ..strokeWidth = 14
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    var rect = Rect.fromCenter(center: Offset(size.width / 2, size.height), width: size.width, height: size.width);
    
    // Draw background arc
    canvas.drawArc(rect, pi, pi, false, paintBg);

    // Draw foreground arc
    double sweepAngle = (score / maxScore).clamp(0.0, 1.0) * pi;
    canvas.drawArc(rect, pi, sweepAngle, false, paintFg);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
