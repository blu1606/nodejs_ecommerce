# Node.js E-commerce API

This repository contains a Node.js-based e-commerce API built with Express.js. It provides a foundation for developing a scalable and robust e-commerce platform.

## Key Features & Benefits

*   **Modular Architecture:** Well-organized project structure for maintainability and scalability.
*   **Authentication & Authorization:** Secure API endpoints with authentication and authorization mechanisms.
*   **Product Management:** APIs for creating, reading, updating, and deleting products.
*   **Cart Management:** Functionality to add, remove, and manage items in a user's cart.
*   **Discount Management:** APIs for creating and applying discounts.
*   **Checkout Process:**  APIs for handling the checkout process.
*   **Asynchronous Handling:** Implements asynchronous programming for optimal performance.
*   **Error Handling:** Robust error handling and response management.
*   **MongoDB Integration:** Utilizes MongoDB for data storage.

## Prerequisites & Dependencies

Before you begin, ensure you have the following installed:

*   **Node.js:** (v16 or higher recommended) - [https://nodejs.org/](https://nodejs.org/)
*   **npm** or **yarn:** (npm is included with Node.js)
*   **MongoDB:**  - [https://www.mongodb.com/](https://www.mongodb.com/) (Running locally or a cloud instance like MongoDB Atlas)

The project uses the following dependencies:

| Dependency    | Version | Description                                          |
| ------------- | ------- | ---------------------------------------------------- |
| express       | ^5.1.0  | Fast, unopinionated, minimalist web framework       |
| mongoose      | ^8.13.2 | MongoDB object modeling tool                      |
| bcrypt        | ^5.1.1  | Library for hashing passwords                       |
| jsonwebtoken  | ^9.0.2  | Implementation of JSON Web Tokens                    |
| lodash        | ^4.17.21 | Provides utility functions                           |
| slugify       | ^1.6.6  | Generates URL-friendly slugs from strings              |
| compression   | ^1.8.0  | Node.js compression middleware                      |
| crypto        | ^1.0.1  | Provides cryptographic functionality                |
| dotenv        | ...     | Loads environment variables from a .env file       |

## Installation & Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd nodejs_ecommerce
    ```

2.  **Install dependencies:**

    ```bash
    npm install  # or yarn install
    ```

3.  **Configure environment variables:**

    *   Create a `.env` file in the root directory.
    *   Add the following environment variables (replace with your actual values):

    ```
    PORT=3000
    MONGODB_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    API_KEY=<your_api_key> #This key can be generated and stored in your DB
    # Example for MongoDB Atlas
    # MONGODB_URI=mongodb+srv://<username>:<password>@<clustername>.mongodb.net/<dbname>?retryWrites=true&w=majority
    ```

4.  **Start the server:**

    ```bash
    node server.js
    ```

    The server will start on the port specified in your `.env` file (default: 3000).

## Usage Examples & API Documentation

After setting up the server, you can access the API endpoints.  You'll need to refer to the `src/routes` directory and corresponding controllers (`src/controllers`) for specifics, as documentation is not embedded in the code itself. Common patterns for API Usage are as follows:

*   **Example API request (using `curl`):**

    ```bash
    curl -X POST -H "Content-Type: application/json" \
         -H "x-api-key: <YOUR_API_KEY>" \
         -d '{"name": "New Product", "description": "Product description", "price": 99.99}' \
         http://localhost:3000/v1/api/product
    ```

*   **API Structure:** The API uses a versioned structure, routes beginning `/v1/api/...`

*   **Authentication:** Many endpoints require authentication using API keys and JSON Web Tokens (JWT).  Refer to `src/auth/authUtils.js` and `src/auth/checkAuth.js` to understand the authentication middleware and token generation.

**Example API endpoints (Conceptual - refer to the code for exact routes and parameters):**

| Endpoint               | Method | Description                               | Requires Authentication |
| ---------------------- | ------ | ----------------------------------------- | --------------------- |
| `/v1/api/access/signup`  | POST   | Register a new user                       | No                    |
| `/v1/api/access/login`   | POST   | Log in an existing user                      | No                    |
| `/v1/api/product`       | POST   | Create a new product                        | Yes (API Key, JWT)    |
| `/v1/api/product/:id`   | GET    | Get a specific product by ID                | Yes (API Key)    |
| `/v1/api/cart`          | POST   | Add a product to the user's cart           | Yes (API Key, JWT)    |
| `/v1/api/discount`      | POST   | Create a new discount code                  | Yes (API Key, JWT)    |

**Postman Collection:**

The `src/postman` directory contains sample Postman collections to help you test the API endpoints.

## Configuration Options

The application can be configured using environment variables in the `.env` file.

| Variable      | Description                                        | Default Value |
| ------------- | -------------------------------------------------- | ------------- |
| PORT          | The port the server will listen on                 | 3000          |
| MONGODB_URI   | The MongoDB connection string                       |               |
| JWT_SECRET    | Secret key used to sign JSON Web Tokens             |               |
| API_KEY       | API Key used for authorization                      |               |

## Contributing Guidelines

Contributions are welcome! To contribute to this project:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with clear, descriptive commit messages.
4.  Push your changes to your forked repository.
5.  Submit a pull request to the main repository.

Please follow the existing code style and conventions.

## License Information

This project does not explicitly specify a license. All rights are reserved by the owner (`blu1606`) unless otherwise specified.

## Acknowledgments

*   This project utilizes various open-source libraries and frameworks.
