
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;
const DB_FILE = path.join(__dirname, "db.json");

// 30 mock profiles
const names = [
  "Aarav", "Priya", "Rahul", "Ananya", "Arjun",
  "Ishita", "Rohan", "Sneha", "Kabir", "Meera",
  "Aditya", "Diya", "Vikram", "Kavya", "Aryan",
  "Riya", "Karan", "Neha", "Dev", "Pooja",
  "Ishan", "Simran", "Varun", "Aisha", "Manav",
  "Tanya", "Nikhil", "Shreya", "Yash", "Naina"
];

const cities = [
  "Mumbai", "Delhi", "Pune", "Bangalore", "Hyderabad",
  "Indore", "Jaipur", "Chennai", "Kolkata", "Ahmedabad"
];

const interests = [
  ["Travel", "Music", "Photography"],
  ["Books", "Food", "Movies"],
  ["Coding", "Fitness", "Technology"],
  ["Art", "Dance", "Travel"],
  ["Sports", "Music", "Reading"]
];

function createProfiles() {
  return names.map((name, index) => ({
    id: index + 1,
    name,
    age: 21 + (index % 7),
    photo: `https://i.pravatar.cc/600?img=${index + 1}`,
    bio: `Hello! I am ${name}. I love exploring new things and meeting people.`,
    city: cities[index % cities.length],
    interests: interests[index % interests.length],

    // Internal field: never expose this in the feed API
    likedCurrentUser: [1, 3, 5, 7, 9, 11, 13, 15].includes(index + 1)
  }));
}

function saveDatabase() {
  fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
}

let database;

if (fs.existsSync(DB_FILE)) {
  database = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
} else {
  database = {
    profiles: createProfiles(),
    swipes: {}
  };

  saveDatabase();
}

// Hide internal information from API responses
function publicProfile(profile) {
  const { likedCurrentUser, ...safeProfile } = profile;
  return safeProfile;
}

// Home route
app.get("/", (req, res) => {
  res.send("Coy Discover Backend is running!");
});

// API 1: Get profiles not yet swiped
app.get("/feed", (req, res) => {
  const feed = database.profiles.filter(
    profile => !database.swipes[profile.id]
  );

  res.json(feed.map(publicProfile));
});

// API 2: Save Like or Pass
app.post("/swipe", (req, res) => {
  const { profileId, action } = req.body;

  const profile = database.profiles.find(
    item => item.id === Number(profileId)
  );

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: "Profile not found"
    });
  }

  if (!["like", "pass"].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Action must be like or pass"
    });
  }

  if (database.swipes[profile.id]) {
    return res.status(409).json({
      success: false,
      message: "This profile has already been swiped"
    });
  }

  database.swipes[profile.id] = action;

  const matched = action === "like" && profile.likedCurrentUser;

  saveDatabase();

  res.json({
    success: true,
    action,
    matched,
    match: matched ? publicProfile(profile) : null,
    message: matched ? "It's a Match!" : "Swipe saved successfully"
  });
});

// API 3: Get mutual matches only
app.get("/matches", (req, res) => {
  const matches = database.profiles.filter(
    profile =>
      database.swipes[profile.id] === "like" &&
      profile.likedCurrentUser
  );

  res.json(matches.map(publicProfile));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
