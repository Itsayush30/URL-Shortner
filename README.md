# URL Shortener NestJS Project

This project provides a URL shortening service built with NestJS, a modern, efficient Node.js framework. It allows users to shorten long URLs, track analytics on shortened URLs, and delete old URLs. Additionally, it features JWT-based authentication for user management. This README file will guide you through the setup process and provide documentation for the services and controllers.


## Setup Instructions

### Prerequisites

Before you begin, make sure you have the following installed on your machine:

- Node.js and npm 
- MongoDB (or a MongoDB Atlas account)
- Git (optional, but recommended)

### Installation

1. Clone the repository to your local machine:

```bash
git clone https://github.com/Itsayush30/URL-Shortner.git
```

2. Navigate into the project directory:


```bash
cd URL-Shortner
```

3. Install dependencies:

```bash
npm install
```

4. Set up environment variables:

```bash
DB_URI=<your_mongodb_uri>
JWT_SECRET = <your_jwt_secret>
JWT_EXPIRES = <your_jwt_expires>
```

5. Start the development server:

```bash
npm run start:dev
```

## APIs

The following RESTful APIs are available:


1. POST /auth/signup: Register a new user.
2. GET /auth/login: Login with email and password to obtain a JWT token.
3. POST /: Generates a new short URL for a provided long URL.
4. GET /:shortId: Redirects to the original URL associated with a short URL.
5. GET /analytics/:shortId: Retrieves analytics data for a specific short URL.
6. POST /delete-old-urls: Deletes URLs older than 24 hours from the database.

NOTE - Also added CRON job to Deletes URLs older than 24 hours from the database.

## Approach

### Backend Development :
1. Utilize Nest.js and TypeScript for constructing a resilient and effective backend.

2. Used MongoDB Database with mongoose ODM.

3. Shorten URLs using the shortId library and store them in a NoSQL database for efficient retrieval and storage.

#### scalability :

 1. Integrate Redis as a caching mechanism to optimize response times and handle high volumes of requests effectively.

 2. Implemented a CRON job to automatically delete URLs older than 24 hours from the database, optimizing performance and storage utilization, and facilitating scalability by reducing data volume and streamlining maintenance tasks

 3. we can Implement horizontal scaling by deploying multiple instances of the application behind a load balancer to distribute incoming traffic evenly.

### User Authentication and Authorization:

1. Implemented JWT-based token authentication to ensure secure access control.

2. Implemented signup and login APIs for user registration and authentication. These APIs securely handle user credentials and issue JWT tokens for accessing protected resources.

3. Ensured that each user has access only to their URLs and associated analytics by implementing authorization.


### Data Management:

1. Utilized MongoDB for robust data storage, ensuring data integrity and enabling efficient querying capabilities.

2. Implemented Redis caching to optimize URL retrieval performance by storing frequently accessed data in memory, enhancing overall system responsiveness.

### Advanced Analytics:

1. Comprehensive Tracking: Detailed analytics system records click timestamps, facilitating analysis of peak traffic times.

2. Referrer Source Tracking: Implemented feature to identify the source URL from which the link was accessed, enabling insight into referral sources for better understanding of traffic origins.

3. Device and Platform Identification: Added capabilities to track browser, device, and platform information, offering insights into user demographics using http headers info.

4. Host Tracking: Includes functionality to monitor host information, aiding in understanding referral sources.

5. API Access: Provides an API endpoint for retrieving analytics, enabling programmable access to valuable insights.

### Security:

1. Implemented rate limiter using ThrottlerModule, a built-in module in NestJS. to prevent abuse of the service by limiting the number of requests made within a specific time frame .

2. Enhances security by mitigating the risk of denial-of-service attacks and ensuring fair usage of resources.

3. Utilized bcrypt, a widely-used hashing algorithm, to securely hash user passwords.

4. Leveraged NestJS's built-in pipe validation mechanism to ensure proper validation of incoming data.

5. enhances security and reliability by validating user input before processing, preventing malformed or malicious input from reaching the application logic.


### Testing:

1.  Utilized Jest for comprehensive testing of application functionalities.