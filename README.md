# High-Precision Scientific & Arithmetic Calculator

A modern, high-precision web calculator built with **React 19**, **TypeScript**, and **Vite**.

Designed with a compiler-inspired architecture: rather than relying on `eval()` or standard floating-point arithmetic, the application uses a formal lexical analyzer, recursive-descent AST parser, and arbitrary-precision decimal evaluation engine.

---

## Key Features

- **Custom Math Engine**: Hand-crafted tokenizer and recursive-descent parser enforcing standard BODMAS / PEMDAS precedence with right-associative exponentiation ($2^{3^2} = 512$).
- **Arbitrary-Precision Arithmetic**: Uses `decimal.js` at 30-digit precision to eliminate IEEE 754 floating-point inaccuracies ($0.1 + 0.2 = 0.3$).
- **Live Step-by-Step Reduction Trace**: Postorder AST evaluation traces each subtree reduction in real time so users can see how expressions are solved.
- **Client-Side Photo/Camera Scan (OCR)**: Scans math expressions using WebAssembly Tesseract.js directly in the browser—zero server uploads, fully private, with strict character whitelisting and draft-first confirmation.
- **Physical Keyboard Support**: Full keyboard input support with single-attachment event routing avoiding memory leaks.
- **Local Persistence & URL Sharing**: History persisted in `localStorage` (capped at 50 items) and instant formula sharing via URL search parameters (`?e=...`).

---

## Project Structure

```
src/
├── engine/              # Decoupled mathematical pipeline (pure TypeScript)
│   ├── ast.ts           # AST node definitions
│   ├── tokenizer.ts     # Lexical scanner with character position tracking
│   ├── parser.ts        # Recursive-descent parser with operator precedence
│   ├── evaluator.ts     # High-precision Decimal.js evaluator & step generator
│   ├── errors.ts        # Position-aware calculator errors
│   └── *.test.ts        # Unit test suites (Vitest)
├── components/          # React UI components (Keypad, Display, Steps, History)
├── hooks/               # Custom hooks (Keyboard listener, History, URL sharing)
└── ocr/                 # Tesseract.js OCR integration with symbol normalization
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Run Unit Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```
