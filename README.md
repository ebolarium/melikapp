# CRM Application - Melikapp

A full-stack CRM (Customer Relationship Management) application built with React and Node.js.

## Project Structure

```
Melikapp/
├── client/           # React frontend application
├── controllers/      # Express route controllers
├── models/          # Mongoose data models
├── routes/          # Express API routes
├── middleware/      # Custom middleware
├── seeders/         # Database seeders
├── server.js        # Main server entry point
├── package.json     # Dependencies and scripts
└── README.md        # Project documentation
```

## Technologies Used

### Frontend
- React 18
- Create React App
- JavaScript/JSX
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Simple Authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

1. Create a `.env` file in the root directory:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   NODE_ENV=development
   ```

### Running the Application

#### Development Mode (Both Frontend & Backend)
```bash
npm run dev
```

#### Backend Only
```bash
npm run server
# or
npm start
```

#### Frontend Only
```bash
npm run client
```

#### Production Build
```bash
npm run build    # Build React app
npm start        # Start production server
```

The backend will run on `http://localhost:5000` and in development mode, the frontend will run on `http://localhost:3000`. In production, the backend serves the React app.

## API Endpoints

- `GET /api` - Server status
- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/companies` - Get companies
- `POST /api/companies` - Create company

## Deployment

This application is configured for easy deployment on platforms like Render.com:

### Render.com Setup
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment Variables**: Set `MONGO_URI` and `NODE_ENV=production`

## Development

This CRM application includes:
- User authentication and authorization
- Company management with search and filtering
- Call tracking and reporting
- Dashboard with statistics
- Responsive UI design

## 📧 Daily Email Reports

The application includes an automated daily email report system that:

- **Automatically sends daily reports at 19:00 Turkey time**
- **Gathers data from CallRecord collection for user "Melike"**
- **Formats reports in Turkish with company names and call results**
- **Uses Brevo SMTP for email delivery**

### Required Environment Variables

```bash
# Brevo SMTP Settings
BREVO_SMTP_USER=your_brevo_login_email
BREVO_SMTP_PASS=your_brevo_smtp_password
MAIL_FROM=noreply@odakkimya.com.tr

# Report Recipients (production)
REPORT_RECIPIENTS=gm@odakkimya.com.tr,director@odakkimya.com.tr
```

### Development Testing

To test the email functionality in development:

```bash
POST /api/reports/test-daily-report
```

This endpoint is only available in development mode and will send a test report to `baris@odakkimya.com.tr`.

### Report Format

The email report includes:
- Date in Turkish format (e.g., "15 Aralık 2024")
- Total number of calls made by Melike
- List of companies called with their results:
  - Sekreter
  - Satınalma
  - Lab Şefi
  - İhtiyaç Yok
  - Potansiyel

## Contributing

This project follows modern MERN stack practices with a clean separation between frontend and backend code. 