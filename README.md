# geniateq_Assignment
# Full-Stack Application with NestJS and React

## Overview

This project is a full-stack application that includes a backend API built with NestJS and MongoDB, and a frontend application built with React. The application supports OTP-based authentication and a custom grid layout manager for displaying participant grids.

### Backend

The backend is developed using NestJS and MongoDB, providing the following features:

- **OTP Authentication:**
  - **Generate OTP:** Sends an OTP to the user's phone number using Twilio.
  - **Verify OTP:** Verifies the OTP and generates a JWT token for authenticated users.

- **Payment Processing:**
  - **Process Payment:** Simulates payment processing and splits the amount into merchant, user, and commission parts.
  - **Transfer Funds:** A cron job initiates fund transfers periodically.

#### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/yourrepository.git
   cd yourrepository

2. use ".env.dist" file for referance to config environment variables.    
