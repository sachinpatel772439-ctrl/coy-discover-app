\# Coy Discover App



A simple and interactive profile discovery application inspired by modern matchmaking platforms. Users can discover profiles, like or pass on them, and view matches when both users have liked each other.



\## Features



\- 30 mock user profiles.

\- One profile displayed at a time.

\- Like and Pass buttons.

\- Mobile swipe gestures:

&#x20; - Swipe right to Like.

&#x20; - Swipe left to Pass.

\- Match detection based on mutual likes.

\- Match notification popup.

\- Dedicated Matches section.

\- Profiles already swiped are not shown again.

\- Empty state when all profiles have been viewed.

\- Swipe and match data persisted using a local JSON file.



\## Tech Stack



\*\*Frontend\*\*

\- React

\- Vite

\- JavaScript

\- CSS



\*\*Backend\*\*

\- Node.js

\- Express.js

\- CORS

\- JSON file-based storage



\## Project Structure



```text

coy-discover-app/

├── backend/

│   ├── server.js

│   ├── package.json

│   └── db.json (generated locally)

│

├── frontend/

│   ├── src/

│   │   ├── App.jsx

│   │   ├── App.css

│   │   ├── index.css

│   │   └── main.jsx

│   └── package.json

│

└── README.md

```



\## Getting Started



\### Prerequisites



\- Node.js

\- npm



\### 1. Clone the repository



```bash

git clone https://github.com/sachinpatel772439-ctrl/coy-discover-app.git

cd coy-discover-app

```



\### 2. Start the Backend



Open a terminal:



```bash

cd backend

npm install

node server.js

```



Backend runs at:



`http://localhost:5000`



\### 3. Start the Frontend



Open a second terminal:



```bash

cd frontend

npm install

npm run dev

```



Open the frontend in your browser:



`http://localhost:5173`



\## API Endpoints



| Method | Endpoint | Description |

|---|---|---|

| GET | `/feed` | Get profiles that have not been swiped |

| POST | `/swipe` | Like or pass on a profile |

| GET | `/matches` | Get mutual matches |



\### Example: POST /swipe



Request body:



```json

{

&#x20; "profileId": 1,

&#x20; "action": "like"

}

```



The backend checks whether the profile has already liked the current user and returns match information.



\## Data Persistence



The backend stores profile and swipe information in `backend/db.json`. This file is generated locally and is excluded from Git using `.gitignore`.



\## Author



Developed as part of the Coy SDE Intern Assignment.

