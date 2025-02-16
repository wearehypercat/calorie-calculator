# Better Body Academy 1RM Calculator

A modern, responsive web application that calculates your one-rep max (1RM) and provides personalized workout recommendations using AI.

## Features

- 🏋️‍♂️ Calculate 1RM based on 8-rep max
- 📊 View percentage breakdowns (60-95%)
- 🤖 AI-powered workout recommendations
- 📱 Fully responsive design
- ⚡ Built with modern tech stack

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI
- Lucide Icons

## Getting Started

1. Clone the repository
```bash
git clone [your-repo-url]
cd bba-1rm-calculator
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Add your Google Gemini API key to the `.env` file:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

4. Run the development server
```bash
npm run dev
```

## Deployment

This project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add the environment variable `VITE_GEMINI_API_KEY` in your Vercel project settings
4. Deploy!

## Usage

1. Input your 8-rep max weight from Week 3
2. View your calculated 1RM
3. Explore percentage breakdowns
4. Generate AI-powered workout recommendations

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/) # calorie-calculator
