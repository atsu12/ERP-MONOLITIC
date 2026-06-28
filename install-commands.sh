

in the backend folder, run the following command to install the necessary dependencies:
"node"

Paste the following command in the terminal to generate a bcrypt hash for the password "frank123":

"const bcrypt = require('bcrypt');
bcrypt.hash('frank123', 10).then(console.log);"

Press Enter twice to execute the command. This will generate a bcrypt hash for the password "frank123" with a salt rounds of 10.
This will generate a hashed password for "frank123" which you can use in your database for authentication purposes.
Copy the generated hash and replace the password field in your user database with this hash. This will allow you to securely authenticate users using bcrypt when they log in.
Then exit the Node.js REPL by typing ".exit" and pressing Enter.

In the MySQL command line interface, run the following SQL command to insert a new user with the hashed password:

"USE inventory_app;

INSERT INTO users (
    username,
    email,
    password_hash,
    role
)
VALUES (
    'frank',
    'frank@example.com',
    'PASTE_HASH_HERE',
    'ADMIN'
);"

From the terminal, run the this command to start the backend server:
"npm start"

Now test the login functionality by sending a POST request to the /login endpoint with the following JSON payload:

curl -X POST http://localhost:5000/api/login \
-H "Content-Type: application/json" \
-d '{"username":"frank","password":"frank123"}'

This should return a successful response with a JWT token if the login is successful. You can use this token for authenticated requests to other endpoints in your application.


Create a new table in the MySQL database to store activity logs. Run the following SQL command in the MySQL command line interface:
USE inventory_app;

CREATE TABLE activity_logs (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT,

    username VARCHAR(100),

    action TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
 


cd frontend
npm install lucide-react
npm install recharts
npm install react-hot-toast
npm install react-loading-skeleton
npm install zustand
npm install framer-motio
npm install socket.io-client


cd backend
npm install socket.io


cd frontend
npm ls xlsx jspdf jspdf-autotable