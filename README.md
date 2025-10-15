# 🚀 Recruitly AIThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



**Recruitly AI** is a next-generation HR recruitment platform designed to help companies find the perfect candidates efficiently. It leverages **AI (Gemini API)** to generate tailored skill tests based on job descriptions and candidate profiles, while also analyzing performance to highlight strengths and weaknesses.## Getting Started



## ✨ FeaturesFirst, run the development server:



- 🤖 **AI-Powered Test Generation** - Generate tailored skill tests using Gemini API```bash

- 📊 **Candidate Analysis** - AI-driven performance analysis with strengths and weaknessesnpm run dev

- 🎨 **Modern UI/UX** - Clean, responsive design with Shadcn/UI components# or

- 🌓 **Dark/Light Mode** - Seamless theme switching with luxury color paletteyarn dev

- 🔐 **Secure Authentication** - Powered by Supabase Auth# or

- 📱 **Fully Responsive** - Works perfectly on desktop and mobile devicespnpm dev

- ⚡ **Lightning Fast** - Built with Next.js 15 and React 19# or

bun dev

## 🎨 Design System```



### Color Palette (Luxury Theme)Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- **Deep Blue** - Primary color for trust and professionalism

- **Gold** - Accent color for luxury and excellenceYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- **Dark Grey** - Secondary color for sophistication

- **Ivory White** - Background for eleganceThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.



## 🛠️ Tech Stack## Learn More



### FrontendTo learn more about Next.js, take a look at the following resources:

- **Next.js 15** (App Router)

- **React 19**- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- **TypeScript**- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- **TailwindCSS v4**

- **Shadcn/UI** - Beautiful, accessible componentsYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

- **Framer Motion** - Smooth animations

- **Lucide React** - Icon library## Deploy on Vercel



### Backend & DatabaseThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

- **Supabase**

  - AuthenticationCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

  - PostgreSQL Database
  - Storage
  - Real-time subscriptions

### AI Integration
- **Gemini API** - For test generation and candidate analysis

## 📦 Project Structure

```
recruitlyai/
├── app/
│   ├── dashboard/          # Dashboard page
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles with luxury theme
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── header.tsx          # Main navigation header
│   ├── theme-toggle.tsx    # Dark/light mode toggle
│   └── theme-provider.tsx  # Theme context provider
├── lib/
│   ├── supabase/           # Supabase client configurations
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client
│   │   └── middleware.ts   # Auth middleware
│   └── utils.ts            # Utility functions
└── middleware.ts           # Next.js middleware for auth
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account
- Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   cd recruitlyai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # Gemini API Configuration
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Set up Supabase**
   
   Create a new project on [Supabase](https://supabase.com) and get your project URL and anon key from the project settings.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Current Implementation Status

### ✅ Completed (Phase 1)
- [x] Next.js project setup with TypeScript
- [x] TailwindCSS v4 configuration
- [x] Shadcn/UI components integration
- [x] Framer Motion animations
- [x] Supabase client configuration
- [x] Authentication system (login/signup)
- [x] Theme system (dark/light mode)
- [x] Responsive header navigation
- [x] Landing page with features
- [x] Dashboard page
- [x] Protected routes with middleware

### 🚧 Coming Soon (Phase 2)
- [ ] Candidate management system
- [ ] AI test generation with Gemini
- [ ] Test administration interface
- [ ] Candidate performance analysis
- [ ] Analytics dashboard
- [ ] Team collaboration features

## 🔐 Authentication Flow

1. User signs up with email and password
2. Supabase creates user account
3. User is redirected to dashboard
4. Middleware protects authenticated routes
5. Session is maintained across page refreshes

## 🎨 Theme Customization

The theme is defined in `app/globals.css` using CSS custom properties. You can customize:

- Primary colors (deep blue)
- Accent colors (gold)
- Secondary colors (dark grey)
- Background colors (ivory white)
- Border radius
- Spacing

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Shadcn/UI](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide](https://lucide.dev/) - Icon library

## 📞 Contact

For questions or feedback, feel free to reach out!

---

**Built with ❤️ using Next.js, Supabase, and AI**
