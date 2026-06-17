# Antecipa 💎
> **Antecipa** is a premium, high-fidelity financial transaction and prepayment (antecipação) simulator. Engineered with a stunning dark-mode glassmorphism Bento UX, it empowers business owners and salespeople to simulate sales structures, estimate payment fees, and optimize receivable payouts in real-time.

---

## ✨ Features

* **High-Fidelity Real-time Calculations**: Formulated with ultra-high precision rounding matching real gateway providers like **Asaas** cent-by-cent (calculating fees on an installment-by-installment basis).
* **Interactive SVG Visualization**: A custom-drawn, pure SVG column chart displaying the complete cash-flow distribution (gross/net columns for Down Payment and individual installments). Clicking any card installment column instantly toggles its prepayment status!
* **Ultra-Smart Financial Optimizer**: Equipped with a real-time advisory agent powered by **9 smart financial rules** that analyze the simulation state and suggest actionable adjustments to minimize transaction costs (e.g., PIX down payment recommendations, fee-pass thresholds, selective prepayment suggestions).
* **Selective Prepayment Simulator**: Toggle specific installments to receive them on D+1 business days or keep them in their original monthly schedules.
* **Hybrid Down Payment Structures**: Seamlessly mix PIX, debit, or credit down payments with credit card installment plans.
* **Dual Fee-Absorption Models**:
  * **Absorb**: The merchant absorbs all credit card and prepayment transaction fees.
  * **Pass (Reverso)**: The merchant passes all fees to the customer, automatically calculating the reverse installment value so the merchant receives the exact desired net payout.
* **Interactive Side-by-Side Scenario Comparer**: Save and compare up to 3 distinct simulation scenarios side-by-side. Displays installment details, prepayment states, and automatically applies semantic tags ("Econômico", "Rápido", "Eficiente") and highlights the absolute "Melhor Opção" with a premium glowing border.
* **Efficiency Sparklines**: The comparison table features elegant inline stacked-bar sparklines that visually represent the ratio of Net Received (emerald green) vs. Total Fees (crimson red) with precise percentages for immediate financial clarity.
* **Global Spacing & High-Density Polish**: Designed with a high-density, compact layout that fits modern 13"/14" laptop screens, minimizing scroll fatigue and emphasizing essential data points without clipping currency values.

---

## 🎨 Premium Aesthetics

Designed with a **Fintech Institutional Luxury** aesthetic:
* **Optical Physics Glassmorphism**: Cards styled with delicate semi-transparent backgrounds, satin blur backdrops, and active-focus neon glows.
* **Fluid Micro-Animations**: Smooth scale transitions, expanding drawers, hover micro-effects, and visual feedback for interactive chart bars.
* **Bento Grid Layout**: Organically groups sale configurations, dashboard metrics, advisor cards, charts, and interactive tables into clear visual zones.
* **Fixed-Header Floating Drawer**: Fully scrollable detailed memory-of-calculation drawer with a fixed top close handle, ensuring the interface never feels cut off.

---

## 🚀 How to Run Locally

Since the application is built on a clean, modern, zero-dependency stack of **pure HTML5, CSS3 HSL-tailored variables, and Vanilla JS**, you can run it instantly without compiling any assets.

### Method 1: Direct File Launch
Double-click `index.html` or open it directly in any modern web browser.

### Method 2: Local HTTP Server (Python)
If you prefer running a local server to test in a clean environment, open your terminal in this directory and execute:
```bash
python -m http.server 8000
```
Then visit: [http://localhost:8000](http://localhost:8000)

### Method 3: Local HTTP Server (Node.js/npx)
Alternatively, use `npx`:
```bash
npx serve .
```

---

## 🛠️ Tech Stack

* **Structure**: Semantic HTML5
* **Style**: HSL Hues, CSS Variables, Flexbox/Grid layouts, Glassmorphism backdrop filters
* **Logic**: Vanilla JavaScript (ES6+), SVG DOM generation
* **Icons**: [Lucide Icons](https://lucide.dev/) (via SVG dynamic instantiations)

---

## 🔒 License

This project is proprietary and confidential. Created for custom fintech sales optimization.
