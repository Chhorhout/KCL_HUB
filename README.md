# KCL Portal - Asset Management System & HRMS Dashboard

A comprehensive web application for managing assets, human resources, and related business operations. Built with React, TypeScript, and Tailwind CSS.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Available Routes](#available-routes)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Contributing](#contributing)

## ✨ Features

### 🔐 Authentication
- Secure login system with session persistence
- Protected routes for authenticated users only
- Automatic session management

### 📊 AMS (Asset Management System)
- **Invoice Management**: Full CRUD operations with pagination and search
- **Owner Type Management**: Create and manage owner types
- **Owner Management**: Manage owners with linked owner types (inline creation supported)
- **Location Management**: Track and manage locations
- **Supplier Management**: Manage supplier information (name, email, phone, address)
- **Maintainer Type Management**: Categorize maintainers
- **Maintainer Management**: Manage maintainers with contact information and types
- **Temporary User Management**: Handle temporary user accounts

### 👥 HRMS (Human Resource Management System)
- **Department Management**: View departments with employee counts
- **Employee Management**: Full CRUD operations with:
  - Advanced search and filtering
  - CSV export functionality
  - Pagination support
  - Inline department creation
  - Scroll position restoration
- **HRMS Dashboard**: Calendar view with Khmer holidays (2025-2029)
- **Expandable Department View**: View employees by department in card-based layout

### 🎨 User Interface
- Modern, responsive design with Tailwind CSS
- Intuitive navigation with sidebar menus
- Real-time search with debouncing
- Pagination controls for large datasets
- Modal dialogs for add/edit/delete operations
- Error handling and validation feedback

## 🛠 Tech Stack

- **Frontend Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.2.2
- **Routing**: React Router DOM 7.9.5
- **HTTP Client**: Axios 1.13.2
- **Styling**: Tailwind CSS 3.4.14
- **Calendar**: React Calendar 6.0.0
- **Charts**: Recharts 3.4.1

## 📦 Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager
- Backend API server running on `http://localhost:5092`

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KCL_POTRAL
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (if needed)
   ```bash
   # Create .env file in the root directory
   # Add any required environment variables with VITE_ prefix
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:5000`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
# Example: Add any required environment variables
# All variables must be prefixed with VITE_ to be accessible in the app
# VITE_API_BASE_URL=http://localhost:5092
```

### Vite Configuration

The application runs on port `5000` by default. You can modify this in `vite.config.ts`:

```typescript
server: {
  host: true,
  port: 5000,
}
```

## 📖 Usage

### Login
1. Navigate to `/login`
2. Enter your username and password
3. Click "Sign In"

### Navigation
- **AMS Section**: Access asset management features from the AMS sidebar
- **HRMS Section**: Access human resource features from the HRMS sidebar
- **Home**: Return to the main dashboard

### Common Operations

#### Adding Records
1. Click the **"Add"** button on any list page
2. Fill in the required fields (marked with red asterisk *)
3. Click **"Add [Entity]"** or **"Create [Entity]"**

#### Editing Records
1. Click the **Edit** icon (pencil) next to any record
2. Modify the fields
3. Click **"Update [Entity]"**

#### Deleting Records
1. Click the **Delete** icon (X) next to any record
2. Confirm the deletion in the popup

#### Searching
- Use the search bar at the top of list pages
- Search filters are applied in real-time with debouncing
- Clear search by clicking the X icon or clearing the input

#### Pagination
- Use **««** for first page
- Use **‹** for previous page
- Click page numbers to jump to specific pages
- Use **›** for next page
- Use **»»** for last page

## 📁 Project Structure

```
KCL_POTRAL/
├── public/                 # Static assets
│   ├── KCL-Logo_no_bg.png
│   └── vite.svg
├── src/
│   ├── components/        # Reusable components
│   │   ├── AMSSidebar.tsx      # AMS navigation sidebar
│   │   ├── Header.tsx          # Main application header
│   │   ├── HRMSSidebar.tsx     # HRMS navigation sidebar
│   │   └── ProtectedRoute.tsx  # Route protection component
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx     # Authentication context
│   ├── pages/             # Page components
│   │   ├── AMSDashboard.tsx
│   │   ├── DepartmentList.tsx
│   │   ├── EmployeeList.tsx
│   │   ├── Home.tsx
│   │   ├── HRMSDashboard.tsx
│   │   ├── InvoiceList.tsx
│   │   ├── LocationList.tsx
│   │   ├── Login.tsx
│   │   ├── MaintainerList.tsx
│   │   ├── MaintainerTypeList.tsx
│   │   ├── OwnerList.tsx
│   │   ├── OwnerTypeList.tsx
│   │   ├── SupplierList.tsx
│   │   ├── TemporaryUserList.tsx
│   │   └── UserGuide.tsx
│   ├── App.tsx            # Main app component with routing
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables (gitignored)
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # This file
```

## 🔌 API Endpoints

The application connects to a backend API running on `http://localhost:5092`. The following endpoints are used:

### AMS Endpoints
- `GET/POST /api/Invoice` - Invoice management
- `GET/POST /api/OwnerType` - Owner type management
- `GET/POST/PUT/DELETE /api/Owner` - Owner management
- `GET/POST/PUT/DELETE /api/Location` - Location management
- `GET/POST/PUT/DELETE /api/Suppliers` - Supplier management
- `GET/POST/PUT/DELETE /api/MaintainerType` - Maintainer type management
- `GET/POST/PUT/DELETE /api/Maintainer` - Maintainer management
- `GET/POST/PUT/DELETE /api/TemporaryUser` - Temporary user management

### HRMS Endpoints
- `GET/POST/PUT/DELETE /api/Department` - Department management
- `GET/POST/PUT/DELETE /api/Employee` - Employee management

### Pagination Headers
The API should return the following headers for paginated responses:
- `X-Total-Count`: Total number of records
- `X-Total-Pages`: Total number of pages
- `X-Current-Page`: Current page number
- `X-Page-Size`: Number of records per page

## 🗺 Available Routes

### Public Routes
- `/login` - Login page

### Protected Routes (Require Authentication)
- `/` - Home dashboard
- `/ams` - AMS Dashboard
- `/ams/invoice` - Invoice List
- `/ams/owner-type` - Owner Type List
- `/ams/owner` - Owner List
- `/ams/location` - Location List
- `/ams/supplier` - Supplier List
- `/ams/maintainer-type` - Maintainer Type List
- `/ams/maintainer` - Maintainer List
- `/ams/temporary-user` - Temporary User List
- `/hrms` - HRMS Dashboard
- `/hrms/department` - Department List
- `/hrms/employee` - Employee List
- `/guide` - User Guide

## 💻 Development

### Development Server
```bash
npm run dev
```
Starts the development server with hot module replacement at `http://localhost:5000`

### Type Checking
```bash
npm run build
```
Runs TypeScript compiler to check for type errors

### Code Style
The project uses:
- TypeScript strict mode
- ESLint (if configured)
- Prettier (if configured)

## 🏗 Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Preview the production build**
   ```bash
   npm run preview
   ```

3. **Deploy**
   - The `dist/` folder contains the production-ready files
   - Deploy the contents of `dist/` to your web server

## 📝 Key Features Explained

### Search Functionality
- **Client-side filtering**: When searching, all records are fetched and filtered on the client
- **Server-side pagination**: When not searching, pagination is handled by the server
- **Debouncing**: Search input is debounced (500ms) to reduce API calls

### CSV Export
- Available in Employee List page
- Exports all employee data with proper CSV formatting
- Includes UTF-8 BOM for Excel compatibility

### Inline Creation
- Owner List: Create Owner Types directly from the Owner form
- Employee List: Create Departments directly from the Employee form
- Maintainer List: Create Maintainer Types directly from the Maintainer form

### Scroll Position Restoration
- After updating records, the page maintains scroll position
- Ensures better user experience when working with long lists

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Check the User Guide page in the application (`/guide`)
- Review the `USER_GUIDE.md` file
- Contact your system administrator

## 🔄 Version

Current Version: **0.0.0**

---

**Built with ❤️ for KCL Portal**

