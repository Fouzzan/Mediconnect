# Mediconnect Backend

This is the Django backend for the Mediconnect application. It provides a RESTful API for user management, authentication (including Face ID), doctor profiles, appointments, health records, and admin features.

## Setup Instructions

### Prerequisites
- Python 3.8+
- pip (Python package installer)
- PostgreSQL 12+ (database server)
- PostgreSQL client libraries

### 1. Database Setup
Create a PostgreSQL database for the project:

```sql
CREATE DATABASE mediconnect;
CREATE USER mediconnect_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mediconnect TO mediconnect_user;
```

### 2. Environment Variables
Set the following environment variables (or update `settings.py` directly):

```bash
export DB_NAME=mediconnect
export DB_USER=mediconnect_user
export DB_PASSWORD=your_password
export DB_HOST=localhost
export DB_PORT=5432
```

### 3. Create and Activate a Virtual Environment
It's highly recommended to use a virtual environment to manage project dependencies.

```bash
# Navigate to the project root directory
cd mediconnect_backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 4. Install Dependencies
Install all the required packages using the `requirements.txt` file.

```bash
pip install -r requirements.txt
```

### 5. Apply Database Migrations
Create and apply database migrations to set up the database schema.

```bash
# Create migrations for all apps
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### 6. Create a Superuser
A superuser is required to access the Django admin panel.

```bash
python manage.py createsuperuser
```
You will be prompted to enter a username, email, and password.

### 7. Run the Development Server
Start the Django development server. By default, it will run on `http://localhost:8000`.

```bash
python manage.py runserver
```

The backend is now running and ready to accept requests from the React frontend (expected to be running on `http://localhost:5173`).

## API Endpoints
The API is available under the `/api/` prefix.

### Authentication
- `POST /api/auth/register/` - Register with Face ID
- `POST /api/auth/face-login/` - Login with Face ID
- `POST /api/auth/refresh/` - Refresh JWT token
- `POST /api/users/login/` - Login with username/password
- `POST /api/users/register/` - Register new user

### Users
- `GET /api/users/` - List users (filtered by role)
- `GET /api/users/me/` - Get current user profile
- `PATCH /api/users/{id}/update_role/` - Update user role

### Patients
- `GET /api/patients/` - List patient profiles
- `GET /api/patients/me/` - Get current patient profile
- `GET /api/patients/{id}/health_info/` - Get health info
- `PUT /api/patients/{id}/health_info/` - Update health info
- `POST /api/patients/{id}/vitals/` - Add vital sign
- `POST /api/patients/{id}/sleep_logs/` - Add sleep log
- `POST /api/patients/{id}/heart_rate_logs/` - Add heart rate log
- `POST /api/patients/{id}/blood_pressure_logs/` - Add blood pressure log
- `POST /api/patients/{id}/blood_oxygen_logs/` - Add blood oxygen log
- `POST /api/patients/{id}/health_documents/` - Upload health document
- `POST /api/patients/{id}/clinical_notes/` - Add clinical note (clinician/admin only)

### Doctors
- `GET /api/doctors/` - List all doctors
- `GET /api/doctors/{id}/` - Get doctor details
- `GET /api/doctors/{id}/availability/` - Get doctor availability

### Appointments
- `GET /api/appointments/` - List appointments (filtered by user role)
- `POST /api/appointments/` - Create appointment
- `GET /api/appointments/{id}/` - Get appointment details
- `PUT /api/appointments/{id}/` - Update appointment
- `GET /api/appointments/patient/?id={patient_id}` - Get patient appointments
- `GET /api/appointments/clinician/?id={clinician_id}` - Get clinician appointments

### Admin
- `GET /api/admin/audit-logs/` - Get audit logs (admin only)
- `GET /api/admin/settings/` - Get platform settings (admin only)
- `PUT /api/admin/settings/` - Update platform settings (admin only)
- `GET /api/admin/users/` - List all users (admin only)
- `PUT /api/admin/users/` - Update user (admin only)
- `DELETE /api/admin/users/{user_id}/` - Delete user (admin only)

## Project Structure
- `api/` - Authentication and admin features
- `users/` - User management
- `patients/` - Patient profiles and health records
- `doctors/` - Doctor profiles
- `appointments/` - Appointment management

## Features
- JWT-based authentication
- Face ID authentication using DeepFace
- Role-based access control (patient, clinician, admin)
- Comprehensive health record management
- Appointment scheduling
- Audit logging
- Platform settings management
- CORS enabled for frontend integration
