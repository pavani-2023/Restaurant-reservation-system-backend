🍽️ Restaurant Reservation System

A full-stack restaurant reservation system that allows users to book tables based on availability and enables admins to manage reservations and restaurant tables.
The system focuses on preventing double bookings, enforcing role-based access control, and maintaining clean backend logic under time constraints.

🚀 Live Deployment

Frontend: https://restauarnt-reservation-system-frontend.onrender.com

Backend API: https://restaurant-reservation-system-backend-4iaz.onrender.com

🏗️ Tech Stack
Frontend

React

React Router

Fetch API

CSS (custom styling)

Backend

Node.js

Express.js

MongoDB (MongoDB Atlas)

Mongoose

JWT Authentication

bcryptjs

Deployment

Frontend: Render

Backend: Render

Database: MongoDB Atlas

⚙️ Setup Instructions
Backend
npm install
node index.js


Create a .env file with:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Frontend
npm install
npm start


Update the API base URL in the frontend environment variables if needed.

🧠 Assumptions Made

Each reservation blocks a fixed 3-hour time slot.

One table can have only one active reservation per time slot.

Users must be authenticated to create or manage reservations.

Only Admins can able to create other admins

🔐 Authentication & Role-Based Access Control

The system uses JWT-based authentication with two roles:

👤 USER

Register and log in

Create reservations

View their own reservations

Cancel their own reservations (subject to business rules)

🛠️ ADMIN

View all reservations

Modify or cancel any reservation

Filter reservationss with date

Manage restaurant tables (add / enable / disable)

Create new admin accounts (admin-only action)

Role-based route protection is enforced on the backend to ensure only authorized users can access restricted APIs.

📅 Reservation & Availability Logic

When a reservation request is made, the backend follows this flow:

Validate required inputs (date, time slot, guest count).

Query the tables collection to find active tables with sufficient capacity.

For each eligible table, check the reservations collection for conflicts using:

tableId

date

timeSlot

status = ACTIVE

If a table has no conflicting reservation for the selected slot, it is assigned to the reservation.

If all suitable tables are already booked, the API returns a conflict response.

This approach ensures that reservations are only created when a valid table is available for the selected time slot.

🕒 Frontend Time-Slot Validation

If the user selects today’s date, past hours and minutes are dynamically disabled on the frontend.

For future dates, all restaurant operating hours are available.

A selected start time automatically blocks a 3-hour reservation window.

Frontend validation improves user experience and reduces invalid requests sent to the backend.

⚠️ Known Limitations

Backend-level past-time validation is not implemented; time validation is currently handled on the frontend.

Under high concurrency, a race condition may occur if multiple users attempt to book the same table at the exact same time.

No database-level locking are used.

No pagination for large reservation datasets.

No real-time availability updates.


🚀 Areas for Improvement (With Additional Time)

Add backend validation to reject past-date and past-time reservations using server time.

Implement database-level safeguards (unique indexes or transactions) to fully prevent race conditions.

Introduce pagination and indexing for better performance.




👩‍💻 Author

Pavani Kakumanu
Full-Stack Developer

