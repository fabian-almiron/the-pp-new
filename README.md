# The Piped Peony Bakery 🧁

A modern, responsive bakery website built with Next.js 15, TypeScript, and Tailwind CSS for The Piped Peony bakery.

## ✨ Features

- **Modern Design**: Beautiful, responsive UI with Tailwind CSS
- **Component Library**: Complete UI components using Radix UI and shadcn/ui
- **Type Safety**: Built with TypeScript for better development experience
- **Performance**: Optimized Next.js 15 application with React 19
- **Theme Support**: Dark/light mode toggle with next-themes
- **Accessibility**: ARIA-compliant components from Radix UI
- **Mobile First**: Responsive design with mobile navigation

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5+
- **Runtime**: React 19
- **Styling**: Tailwind CSS 3.4+
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Package Manager**: pnpm
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js**: Version 18.17 or higher ([Download](https://nodejs.org/))
- **pnpm**: Fast, disk space efficient package manager
  ```bash
  npm install -g pnpm
  ```

### Installation

1. **Clone the repository:**
   ```bash
   git clone [repository-url]
   cd piped-peony-bakery
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

You should see the bakery website running locally! 🎉

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server on localhost:3000 |
| `pnpm build` | Build the application for production |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint to check for code issues |

## 📁 Project Structure

```
piped-peony-bakery/
├── app/                    # Next.js App Router directory
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx          # Home page
│   └── shop/             # Shop section
│       └── page.tsx      # Shop page
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   │   ├── button.tsx    # Button component
│   │   ├── card.tsx      # Card component
│   │   ├── sheet.tsx     # Sheet/drawer component
│   │   └── ...           # Other UI components
│   ├── faq-accordion.tsx # FAQ accordion component
│   ├── site-header.tsx   # Main navigation header
│   ├── site-footer.tsx   # Site footer
│   └── theme-provider.tsx # Theme provider for dark/light mode
├── hooks/                # Custom React hooks
│   ├── use-mobile.tsx    # Mobile detection hook
│   └── use-toast.ts      # Toast notification hook
├── lib/                  # Utility functions and configurations
│   └── utils.ts          # Utility functions (cn, etc.)
├── public/               # Static assets
│   ├── placeholder-logo.png
│   └── ...
├── styles/               # Additional stylesheets
│   └── globals.css       # Global CSS (legacy)
├── components.json       # shadcn/ui configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── next.config.mjs       # Next.js configuration
```

## 🎨 Development Guidelines

### Code Style

- Use **TypeScript** for all new files
- Follow **React functional components** with hooks
- Use **Tailwind CSS** for styling (avoid custom CSS when possible)
- Import UI components from `@/components/ui/`
- Use the `cn()` utility for conditional classes

### Component Development

1. **UI Components**: Use shadcn/ui components from `components/ui/`
2. **Custom Components**: Place in `components/` directory
3. **Naming**: Use PascalCase for components (e.g., `SiteHeader`)
4. **Props**: Define TypeScript interfaces for component props

### Key Patterns

```typescript
// Component with props interface
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function CustomButton({ variant = 'default', size = 'md', children }: ButtonProps) {
  return (
    <button className={cn(
      "base-styles",
      variant === 'outline' && "outline-styles",
      size === 'sm' && "small-styles"
    )}>
      {children}
    </button>
  )
}
```

### Adding New UI Components

The project uses [shadcn/ui](https://ui.shadcn.com/) for UI components:

```bash
# Add a new component
npx shadcn@latest add [component-name]

# Example: Add a calendar component
npx shadcn@latest add calendar
```

## 🔧 Customization

### Theme & Styling

- **Colors**: Edit `tailwind.config.ts` for custom color palette
- **Fonts**: Update font imports in `app/layout.tsx`
- **Global styles**: Modify `app/globals.css`
- **Component styles**: Use Tailwind classes or CSS modules

### Adding New Pages

1. Create a new directory in `app/`
2. Add a `page.tsx` file
3. Export a default React component

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Welcome to The Piped Peony Bakery!</p>
    </div>
  )
}
```

## 🚨 Common Issues & Solutions

### React Key Warnings
Always provide unique keys when rendering lists:
```typescript
// ❌ Bad - duplicate keys
{items.map(item => <div key={item.href}>...</div>)}

// ✅ Good - unique keys
{items.map(item => <div key={item.id}>...</div>)}
```

### TypeScript Errors
- Run `pnpm lint` to check for issues
- Ensure all props have proper TypeScript interfaces
- Use `@types/` packages for third-party libraries

### Build Errors
- Check that all imports are correct
- Ensure all dependencies are installed: `pnpm install`
- Clear Next.js cache: `rm -rf .next`

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Deploy automatically on every push to main branch

### Manual Deployment

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Commit Message Format

Use conventional commits:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests

## 📞 Support

For questions or issues:
- Check existing [GitHub Issues](https://github.com/your-repo/issues)
- Create a new issue with detailed description
- Contact the development team

## 📄 License

This project is private and proprietary to The Piped Peony Bakery.

---

**Happy coding! 🚀**

Made with ❤️ by the development team