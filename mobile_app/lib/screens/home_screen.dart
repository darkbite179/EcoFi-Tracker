import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

import '../constants.dart';
import '../widgets/carbon_gauge.dart';
import '../widgets/token_banner.dart';
import '../widgets/eco_swap_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

enum AppState { scan, loading, results }

class _HomeScreenState extends State<HomeScreen> {
  AppState _appState = AppState.scan;
  Map<String, dynamic>? _resultData;
  final TextEditingController _receiptController = TextEditingController();
  final ImagePicker _picker = ImagePicker();
  XFile? _capturedImage;

  // Wallet simulation
  bool _walletConnected = false;
  final String _walletAddress = "0x8C98...1FF4DE";
  final String _fullWalletAddress = "0x8C98CC3BF42030434E1380374311dBf2b01FF4DE";
  int _leafBalance = 0;

  // Loading animation
  int _loadingStep = 0;
  final List<String> _loadingMessages = [
    "📸 Processing receipt image...",
    "🔍 Extracting items via AI...",
    "🌍 Querying carbon database...",
    "🌿 Generating eco-swaps & rewards...",
  ];

  void _connectWallet() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgBase,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.borderCard),
        ),
        title: Row(
          children: [
            const Icon(Icons.account_balance_wallet, color: AppColors.greenPrimary),
            const SizedBox(width: 8),
            Text(
              _walletConnected ? 'Wallet Connected' : 'Connect Wallet',
              style: const TextStyle(color: AppColors.greenPrimary, fontSize: 18),
            ),
          ],
        ),
        content: _walletConnected
            ? Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('ADDRESS', style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(12)),
                    child: Text(_fullWalletAddress, style: const TextStyle(color: AppColors.textPrimary, fontSize: 11, fontFamily: 'monospace')),
                  ),
                  const SizedBox(height: 16),
                  const Text('BALANCE', style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('$_leafBalance \$LEAF', style: const TextStyle(color: AppColors.greenPrimary, fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  const Text('Polygon Amoy Testnet', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: () {
                      setState(() {
                        _walletConnected = false;
                        _leafBalance = 0;
                      });
                      Navigator.of(ctx).pop();
                    },
                    child: const Text('Disconnect', style: TextStyle(color: AppColors.red)),
                  ),
                ],
              )
            : Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'On mobile, wallet connection is simulated for the hackathon demo. On desktop, use MetaMask.',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        setState(() => _walletConnected = true);
                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Connected: $_walletAddress'),
                            backgroundColor: AppColors.greenPrimary,
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        );
                      },
                      icon: const Icon(Icons.account_balance_wallet),
                      label: const Text('Simulate Wallet Connect'),
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Future<void> _captureReceipt() async {
    try {
      final XFile? photo = await _picker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1200,
        imageQuality: 85,
      );
      if (photo != null) {
        setState(() => _capturedImage = photo);
        // Auto-analyze after capture
        _analyzeReceipt(null, fromCamera: true);
      }
    } catch (e) {
      debugPrint("Camera error: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text("Camera not available. Use text input or presets instead."),
          backgroundColor: AppColors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  Future<void> _pickFromGallery() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1200,
        imageQuality: 85,
      );
      if (image != null) {
        setState(() => _capturedImage = image);
        _analyzeReceipt(null, fromCamera: true);
      }
    } catch (e) {
      debugPrint("Gallery error: $e");
    }
  }

  Future<void> _analyzeReceipt(String? presetId, {bool fromCamera = false}) async {
    setState(() {
      _appState = AppState.loading;
      _loadingStep = 0;
      _resultData = null;
    });

    // Simulate multi-step loading
    for (int i = 0; i < 4; i++) {
      await Future.delayed(const Duration(milliseconds: 800));
      if (!mounted) return;
      setState(() => _loadingStep = i);
    }

    try {
      if (presetId != null) {
        setState(() {
          _resultData = AppConstants.mockResults[presetId];
          _appState = AppState.results;
        });
      } else if (fromCamera && _capturedImage != null) {
        // Camera capture → In a production app, we'd send the image to an OCR service.
        // For the hackathon demo, we simulate OCR extraction with the "average" mock.
        // The backend currently only accepts text, so this is the expected flow.
        await Future.delayed(const Duration(milliseconds: 500));
        setState(() {
          _resultData = AppConstants.mockResults['average'];
          _appState = AppState.results;
        });
      } else {
        // Text-based analysis via backend
        final response = await http.post(
          Uri.parse('${AppConstants.backendUrl}/api/analyze'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'receiptText': _receiptController.text}),
        );
        if (response.statusCode == 200) {
          setState(() {
            _resultData = jsonDecode(response.body);
            _appState = AppState.results;
          });
        } else {
          throw Exception('Backend error');
        }
      }
    } catch (e) {
      debugPrint("Error: $e");
      setState(() {
        _resultData = AppConstants.mockResults['average'];
        _appState = AppState.results;
      });
    }
  }

  void _reset() {
    setState(() {
      _appState = AppState.scan;
      _resultData = null;
      _capturedImage = null;
      _receiptController.clear();
    });
  }

  void _claimTokens() {
    final int reward = _resultData?['leafReward'] ?? 0;
    final String fakeTxHash = '0x${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}a4f3d6e977b6d684fd';

    setState(() => _leafBalance += reward);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgBase,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.greenPrimary),
        ),
        title: const Row(
          children: [
            Icon(Icons.check_circle_outline, color: AppColors.greenPrimary, size: 28),
            SizedBox(width: 8),
            Text('Tokens Minted!', style: TextStyle(color: AppColors.greenPrimary, fontSize: 18)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('+$reward \$LEAF minted to your wallet', style: const TextStyle(color: AppColors.textPrimary, fontSize: 15)),
            const SizedBox(height: 16),
            const Text('TRANSACTION', style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(8)),
              child: Text(fakeTxHash, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10, fontFamily: 'monospace')),
            ),
            const SizedBox(height: 12),
            const Text('NETWORK', style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            const Text('Polygon Amoy Testnet (chainId: 80002)', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
            const SizedBox(height: 12),
            Text('New Balance: $_leafBalance \$LEAF', style: const TextStyle(color: AppColors.greenPrimary, fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Awesome!', style: TextStyle(color: AppColors.greenPrimary)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.energy_savings_leaf, color: AppColors.greenPrimary),
            SizedBox(width: 8),
            Text('EcoFi', style: TextStyle(color: AppColors.greenPrimary, fontWeight: FontWeight.bold)),
            Text(' Tracker', style: TextStyle(color: AppColors.textSecondary)),
          ],
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        actions: [
          GestureDetector(
            onTap: _connectWallet,
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: _walletConnected ? AppColors.greenDim : AppColors.greenPrimary,
                borderRadius: BorderRadius.circular(20),
                border: _walletConnected ? Border.all(color: AppColors.greenPrimary) : null,
              ),
              alignment: Alignment.center,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (_walletConnected) ...[                    
                    const Icon(Icons.circle, color: AppColors.greenPrimary, size: 8),
                    const SizedBox(width: 6),
                    Text(_walletAddress, style: const TextStyle(color: AppColors.greenPrimary, fontWeight: FontWeight.bold, fontSize: 11)),
                  ] else
                    const Text('Connect Wallet', style: TextStyle(color: AppColors.bgBase, fontWeight: FontWeight.bold, fontSize: 12)),
                ],
              ),
            ),
          )
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_appState == AppState.scan) _buildScanScreen(),
              if (_appState == AppState.loading) _buildLoadingScreen(),
              if (_appState == AppState.results && _resultData != null) _buildResultsScreen(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildScanScreen() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 24),
        const Text(
          "Scan Groceries.\nEarn \$LEAF.\nSave the Planet.",
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, height: 1.2),
        ),
        const SizedBox(height: 16),
        const Text(
          "Your grocery receipt becomes a carbon report and a revenue stream.",
          textAlign: TextAlign.center,
          style: TextStyle(color: AppColors.textSecondary, fontSize: 16),
        ),
        const SizedBox(height: 40),

        // ── Camera Scan Button ──
        GestureDetector(
          onTap: _captureReceipt,
          child: Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.greenPrimary.withAlpha(76), width: 2),
            ),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.greenDim,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.greenPrimary.withAlpha(76)),
                  ),
                  child: const Icon(Icons.camera_alt_rounded, size: 40, color: AppColors.greenPrimary),
                ),
                const SizedBox(height: 16),
                const Text("Tap to Scan Receipt", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.greenPrimary)),
                const SizedBox(height: 8),
                const Text("Take a photo of your grocery receipt", style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
              ],
            ),
          ),
        ),

        const SizedBox(height: 16),

        // ── Gallery / Upload Button ──
        OutlinedButton.icon(
          onPressed: _pickFromGallery,
          icon: const Icon(Icons.photo_library_outlined, color: AppColors.greenPrimary),
          label: const Text("Upload from Gallery", style: TextStyle(color: AppColors.textPrimary)),
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            side: const BorderSide(color: AppColors.borderCard),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
        ),

        const SizedBox(height: 32),

        // ── OR Divider ──
        Row(
          children: [
            Expanded(child: Divider(color: AppColors.borderCard)),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Text("OR", style: TextStyle(color: AppColors.textMuted, fontSize: 12, fontWeight: FontWeight.bold)),
            ),
            Expanded(child: Divider(color: AppColors.borderCard)),
          ],
        ),

        const SizedBox(height: 24),

        // ── Text Input Section ──
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.borderCard),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text("Paste Receipt Text", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              const SizedBox(height: 12),
              TextField(
                controller: _receiptController,
                maxLines: 3,
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                decoration: InputDecoration(
                  hintText: "E.g. 1kg Beef Mince, 2L Whole Milk...",
                  hintStyle: const TextStyle(color: AppColors.textMuted),
                  filled: true,
                  fillColor: AppColors.bgBase,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => _analyzeReceipt(null),
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                child: const Text('Analyze Text', style: TextStyle(fontSize: 15)),
              ),
            ],
          ),
        ),

        const SizedBox(height: 32),

        // ── Hackathon Presets ──
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.borderCard),
          ),
          child: Column(
            children: [
              const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.science_outlined, color: AppColors.textMuted, size: 18),
                  SizedBox(width: 8),
                  Text("Hackathon Demo Presets", style: TextStyle(color: AppColors.textSecondary, fontSize: 14, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _buildPresetButton("🥩", "High\nCarbon", 'high_carbon')),
                  const SizedBox(width: 10),
                  Expanded(child: _buildPresetButton("🍗", "Average\nBasket", 'average')),
                  const SizedBox(width: 10),
                  Expanded(child: _buildPresetButton("🌿", "Green\nChampion", 'green')),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPresetButton(String emoji, String label, String id) {
    return InkWell(
      onTap: () => _analyzeReceipt(id),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: AppColors.bgBase,
          border: Border.all(color: AppColors.borderCard),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 28)),
            const SizedBox(height: 8),
            Text(label, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingScreen() {
    return Container(
      constraints: BoxConstraints(minHeight: MediaQuery.of(context).size.height * 0.6),
      alignment: Alignment.center,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Show captured image as preview during loading
          if (_capturedImage != null) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: kIsWeb
                  ? Image.network(_capturedImage!.path, height: 150, fit: BoxFit.cover)
                  : Image.file(File(_capturedImage!.path), height: 150, fit: BoxFit.cover),
            ),
            const SizedBox(height: 24),
          ],
          const SizedBox(
            width: 60,
            height: 60,
            child: CircularProgressIndicator(color: AppColors.greenPrimary, strokeWidth: 4),
          ),
          const SizedBox(height: 32),
          Text(
            _loadingMessages[_loadingStep.clamp(0, 3)],
            style: const TextStyle(color: AppColors.greenPrimary, fontSize: 18, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          const Text(
            "Evaluating supply chain database...",
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsScreen() {
    final double totalCO2 = (_resultData!['totalCO2'] ?? 0).toDouble();
    final double vsAverage = (_resultData!['vsAverage'] ?? 0).toDouble();
    final int leafReward = _resultData!['leafReward'] ?? 0;
    final List<dynamic> items = _resultData!['items'] ?? [];
    bool isPositive = vsAverage <= 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Row(
              children: [
                Icon(Icons.search, color: Colors.blueAccent),
                SizedBox(width: 8),
                Text("Analysis Complete", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              ],
            ),
            TextButton.icon(
              onPressed: _reset,
              icon: const Icon(Icons.arrow_back, size: 16, color: AppColors.greenPrimary),
              label: const Text("Scan Again", style: TextStyle(color: AppColors.greenPrimary)),
            )
          ],
        ),
        const SizedBox(height: 24),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 24),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderCard),
                ),
                child: Column(
                  children: [
                    CarbonGauge(score: totalCO2),
                    const SizedBox(height: 24),
                    const Text("Total Basket\nFootprint", textAlign: TextAlign.center, style: TextStyle(color: AppColors.textSecondary)),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderCard),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("VS. REGIONAL AVERAGE", style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text(
                      "${isPositive ? '' : '+'}${vsAverage.toStringAsFixed(1)} kg",
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: isPositive ? AppColors.greenPrimary : AppColors.red),
                    ),
                    const SizedBox(height: 4),
                    const Text("Regional avg: 14 kg CO₂e", style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                  ],
                ),
              ),
            )
          ],
        ),
        if (leafReward > 0) TokenBanner(leafAmount: leafReward, onClaim: _claimTokens),
        const SizedBox(height: 32),
        const Row(
          children: [
            Icon(Icons.sync_alt, color: Colors.blueAccent, size: 20),
            SizedBox(width: 8),
            Text("Basket Details & Eco-Swaps", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 16),
        ...items.map((item) => EcoSwapCard(itemData: item as Map<String, dynamic>)),
      ],
    );
  }
}
