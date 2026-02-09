# FLOWEASE — Restorative Practice Sanctuary

FLOWEASE is a comprehensive restorative practice management platform designed to bring calm, mindfulness, and wellness into your daily routine. Built with modern web technologies, FLOWEASE integrates scheduling, billing, analytics, and multi-calendar synchronization to create a seamless experience for individuals and practitioners.

## Features

- **Dashboard** — Real-time insights and activity overview
- **Scheduling** — Intuitive appointment & practice session management
- **Calendar Integration** — Sync with Google Calendar, Microsoft 365, and iCloud
- **Billing** — Track and manage payments and invoices
- **Settings** — Personalize your experience and manage integrations
- **Responsive Design** — Optimized for desktop, tablet, and mobile

## Tech Stack

- **Frontend:** React + TypeScript
- **Styling:** Tailwind CSS + PostCSS
- **Build Tool:** Vite
- **Package Manager:** npm

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TinaAJohnson/flowease.git
   cd flowease
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your API keys:
   ```env
   VITE_GOOGLE_CALENDAR_API_KEY=your_google_api_key
   VITE_MICROSOFT_365_CLIENT_ID=your_microsoft_client_id
   VITE_ICLOUD_API_KEY=your_icloud_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Project Structure

```
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── Scheduling.tsx
│   ├── Billing.tsx
│   ├── Settings.tsx
│   └── Sidebar.tsx
├── App.tsx             # Main app component
├── index.tsx           # Entry point
├── vite.config.ts      # Vite configuration
└── tailwind.config.js  # Tailwind CSS config
```

## Upcoming Features

- Advanced calendar analytics
- Real-time collaboration
- Mobile app (iOS/Android)
- AI-powered insights and recommendations
- Integration with additional calendar providers

## Contributing

We welcome contributions! Please see [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for our community guidelines.

### Steps to Contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes and commit (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on [GitHub Issues](https://github.com/TinaAJohnson/flowease/issues).

---

Built with ❤️ by the FLOWEASE team. Bringing mindfulness and wellness to your practice.
