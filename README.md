# Piped Peony Bakery

A modern, responsive bakery website built with Next.js 15, TypeScript, and Tailwind CSS.

## ✨ Features

- **Modern Design**: Beautiful, responsive UI with Tailwind CSS
- **Component Library**: Complete UI components using Radix UI and shadcn/ui
- **Type Safety**: Built with TypeScript for better development experience
- **Performance**: Optimized Next.js application with modern web standards
- **Theme Support**: Dark/light mode toggle with next-themes
- **Accessibility**: ARIA-compliant components from Radix UI

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (install with `npm install -g pnpm`)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fabian-almiron/the-pp-new.git
cd the-pp-new
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## 🌐 Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push to main

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fabian-almiron/the-pp-new)

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   └── shop/             # Shop pages
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── site-header.tsx   # Site navigation
│   ├── site-footer.tsx   # Site footer
│   └── ...
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
└── styles/              # Additional styles
```

## 🎨 Customization

The project uses Tailwind CSS for styling. You can customize the design by:

- Editing `tailwind.config.ts` for theme customization
- Modifying components in the `components/` directory
- Adding custom styles in `app/globals.css`

## 📄 License

This project is private and proprietary.