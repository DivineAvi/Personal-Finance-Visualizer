# Finance Visualizer

A comprehensive personal finance management application built with Next.js, React, TypeScript, and MongoDB. This application helps you track transactions, manage budgets, visualize spending patterns, and gain insights into your financial habits.

## Features

- Transaction tracking with CRUD operations
- Budget management by category
- Data visualization with charts (monthly expenses, category breakdown)
- Financial insights and spending analysis
- MongoDB integration for data persistence

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn
- MongoDB database (Atlas or local)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/finance-visualizer.git
cd finance-visualizer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your MongoDB connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-visualizer?retryWrites=true&w=majority
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## MongoDB Setup

1. Create a MongoDB Atlas account or use a local MongoDB instance
2. Create a new database named `finance-visualizer`
3. Add your connection string to the `.env.local` file
4. The application will automatically create the necessary collections:
   - `transactions`
   - `budgets`

## Project Structure

- `app/`: Next.js app directory with pages and layout
- `components/`: React components
- `context/`: React context providers for state management
- `lib/`: Utility functions including MongoDB connection
- `models/`: MongoDB models
- `types/`: TypeScript type definitions
- `public/`: Static assets

## Technologies Used

- Next.js
- React
- TypeScript
- MongoDB
- Mongoose
- Recharts for data visualization
- Tailwind CSS for styling
