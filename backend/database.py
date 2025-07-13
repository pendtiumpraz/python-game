from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
from datetime import datetime
import uuid

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/codequest")
client = AsyncIOMotorClient(MONGO_URL)
db = client.codequest

# Collections
users_collection = db.users
quests_collection = db.quests
progress_collection = db.progress
leaderboard_collection = db.leaderboard

# Pydantic models
class User(BaseModel):
    id: str
    uid: str  # Firebase UID
    email: str
    username: str
    display_name: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool = True

class Quest(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str  # beginner, intermediate, advanced
    category: str  # basics, oop, data-structures, algorithms
    xp_reward: int
    estimated_time: str
    instructions: List[str]
    topics: List[str]
    code_template: str
    expected_output: str
    test_cases: List[Dict]
    created_at: datetime
    is_active: bool = True

class UserProgress(BaseModel):
    id: str
    user_id: str
    level: int = 1
    xp: int = 0
    completed_quests: List[str] = []
    current_quest: Optional[str] = None
    achievements: List[str] = []
    total_time_spent: int = 0  # in minutes
    last_activity: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class CodeExecution(BaseModel):
    id: str
    user_id: str
    quest_id: str
    code: str
    output: str
    success: bool
    execution_time: float
    test_results: List[Dict]
    created_at: datetime

class Hint(BaseModel):
    id: str
    user_id: str
    quest_id: str
    hint_text: str
    context: str
    created_at: datetime

# Database helper functions
async def init_db():
    """Initialize database collections and indexes"""
    try:
        # Create indexes
        await users_collection.create_index("uid", unique=True)
        await users_collection.create_index("email", unique=True)
        await progress_collection.create_index("user_id", unique=True)
        await quests_collection.create_index("id", unique=True)
        
        # Insert default quests if not exist
        await create_default_quests()
        
        print("Database initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")

async def create_default_quests():
    """Create default quests in the database"""
    default_quests = [
        {
            "id": "basic-1",
            "title": "Variables & Data Types",
            "description": "Learn the fundamentals of Python variables and basic data types. In this quest, you will create variables of different types and perform basic operations.",
            "difficulty": "beginner",
            "category": "basics",
            "xp_reward": 50,
            "estimated_time": "15 min",
            "instructions": [
                "Create a variable named 'name' with your name as a string",
                "Create a variable named 'age' with your age as an integer",
                "Create a variable named 'height' with your height as a float",
                "Create a variable named 'is_student' with a boolean value",
                "Print all variables with descriptive messages"
            ],
            "topics": ["Variables", "Strings", "Numbers", "Booleans"],
            "code_template": '''# Welcome to your first Python quest!
# Let's learn about variables and data types

# TODO: Create a string variable for your name
name = "Your Name Here"

# TODO: Create an integer variable for your age
age = 25

# TODO: Create a float variable for your height in meters
height = 1.75

# TODO: Create a boolean variable for student status
is_student = True

# TODO: Print all variables with descriptive messages
print(f"Name: {name}")
print(f"Age: {age}")
print(f"Height: {height} meters")
print(f"Is student: {is_student}")

# Bonus: Try some basic operations
print(f"In 5 years, you will be {age + 5} years old")
''',
            "expected_output": "Variables should be printed with descriptive messages",
            "test_cases": [
                {"description": "Check if name variable is defined", "test": "name variable should be a string", "points": 10},
                {"description": "Check if age variable is defined", "test": "age variable should be an integer", "points": 10},
                {"description": "Check if height variable is defined", "test": "height variable should be a float", "points": 10},
                {"description": "Check if is_student variable is defined", "test": "is_student variable should be a boolean", "points": 10},
                {"description": "Check if all variables are printed", "test": "All variables should be printed with descriptive messages", "points": 10}
            ],
            "created_at": datetime.utcnow(),
            "is_active": True
        },
        {
            "id": "basic-2",
            "title": "Control Flow",
            "description": "Master if statements, loops, and conditional logic to control the flow of your programs.",
            "difficulty": "beginner",
            "category": "basics",
            "xp_reward": 75,
            "estimated_time": "20 min",
            "instructions": [
                "Create a program that checks if a number is positive, negative, or zero",
                "Use a for loop to print numbers from 1 to 10",
                "Use a while loop to find the sum of first 5 numbers",
                "Create a simple guessing game logic"
            ],
            "topics": ["If statements", "For loops", "While loops", "Conditional logic"],
            "code_template": '''# Control Flow Quest
# Let's learn about if statements and loops

# TODO: Check if a number is positive, negative, or zero
number = 42

if number > 0:
    print(f"{number} is positive")
elif number < 0:
    print(f"{number} is negative")
else:
    print(f"{number} is zero")

# TODO: Use a for loop to print numbers from 1 to 10
print("Numbers from 1 to 10:")
for i in range(1, 11):
    print(i)

# TODO: Use a while loop to find sum of first 5 numbers
sum_result = 0
count = 1
while count <= 5:
    sum_result += count
    count += 1

print(f"Sum of first 5 numbers: {sum_result}")

# TODO: Simple guessing game logic
secret_number = 7
guess = 5

if guess == secret_number:
    print("Congratulations! You guessed it!")
elif guess < secret_number:
    print("Too low!")
else:
    print("Too high!")
''',
            "expected_output": "Program should demonstrate if statements and loops",
            "test_cases": [
                {"description": "Check conditional logic", "test": "Number classification should work correctly", "points": 15},
                {"description": "Check for loop", "test": "For loop should print numbers 1 to 10", "points": 15},
                {"description": "Check while loop", "test": "While loop should calculate sum correctly", "points": 15},
                {"description": "Check guessing game logic", "test": "Guessing game should provide correct feedback", "points": 15}
            ],
            "created_at": datetime.utcnow(),
            "is_active": True
        },
        {
            "id": "basic-3",
            "title": "Functions",
            "description": "Create reusable code with functions and parameters",
            "difficulty": "beginner",
            "category": "basics",
            "xp_reward": 100,
            "estimated_time": "25 min",
            "instructions": [
                "Create a function that greets a user",
                "Create a function that calculates the area of a rectangle",
                "Create a function that checks if a number is even or odd",
                "Create a function that returns the maximum of two numbers"
            ],
            "topics": ["Functions", "Parameters", "Return values", "Function calls"],
            "code_template": '''# Functions Quest
# Let's learn about creating and using functions

# TODO: Create a function that greets a user
def greet_user(name):
    return f"Hello, {name}! Welcome to CodeQuest!"

# TODO: Create a function that calculates the area of a rectangle
def calculate_area(length, width):
    return length * width

# TODO: Create a function that checks if a number is even or odd
def is_even(number):
    return number % 2 == 0

# TODO: Create a function that returns the maximum of two numbers
def find_max(a, b):
    return max(a, b)

# Test your functions
print(greet_user("Adventurer"))
print(f"Area of rectangle (5x3): {calculate_area(5, 3)}")
print(f"Is 8 even? {is_even(8)}")
print(f"Max of 10 and 7: {find_max(10, 7)}")
''',
            "expected_output": "Functions should work correctly and return expected values",
            "test_cases": [
                {"description": "Check greet_user function", "test": "Function should return proper greeting", "points": 20},
                {"description": "Check calculate_area function", "test": "Function should calculate area correctly", "points": 20},
                {"description": "Check is_even function", "test": "Function should identify even/odd numbers", "points": 20},
                {"description": "Check find_max function", "test": "Function should return maximum value", "points": 20}
            ],
            "created_at": datetime.utcnow(),
            "is_active": True
        }
    ]
    
    for quest in default_quests:
        existing = await quests_collection.find_one({"id": quest["id"]})
        if not existing:
            await quests_collection.insert_one(quest)

# User management functions
async def create_user(uid: str, email: str, username: str, display_name: str = None):
    """Create a new user"""
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "uid": uid,
        "email": email,
        "username": username,
        "display_name": display_name or username,
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow(),
        "is_active": True
    }
    
    await users_collection.insert_one(user)
    
    # Create initial progress
    progress = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "level": 1,
        "xp": 0,
        "completed_quests": [],
        "current_quest": None,
        "achievements": [],
        "total_time_spent": 0,
        "last_activity": datetime.utcnow(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await progress_collection.insert_one(progress)
    return user

async def get_user_by_uid(uid: str):
    """Get user by Firebase UID"""
    return await users_collection.find_one({"uid": uid})

async def get_user_progress(user_id: str):
    """Get user progress"""
    return await progress_collection.find_one({"user_id": user_id})

async def update_user_progress(user_id: str, progress_data: dict):
    """Update user progress"""
    progress_data["updated_at"] = datetime.utcnow()
    await progress_collection.update_one(
        {"user_id": user_id},
        {"$set": progress_data}
    )

# Quest management functions
async def get_all_quests():
    """Get all active quests"""
    cursor = quests_collection.find({"is_active": True})
    quests = []
    async for quest in cursor:
        quest.pop("_id", None)  # Remove MongoDB _id
        quests.append(quest)
    return quests

async def get_quest_by_id(quest_id: str):
    """Get quest by ID"""
    quest = await quests_collection.find_one({"id": quest_id, "is_active": True})
    if quest:
        quest.pop("_id", None)
    return quest

# Code execution functions
async def save_code_execution(user_id: str, quest_id: str, code: str, output: str, success: bool, execution_time: float, test_results: List[Dict]):
    """Save code execution result"""
    execution = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "quest_id": quest_id,
        "code": code,
        "output": output,
        "success": success,
        "execution_time": execution_time,
        "test_results": test_results,
        "created_at": datetime.utcnow()
    }
    
    await db.code_executions.insert_one(execution)

# Hint functions
async def save_hint(user_id: str, quest_id: str, hint_text: str, context: str):
    """Save hint request"""
    hint = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "quest_id": quest_id,
        "hint_text": hint_text,
        "context": context,
        "created_at": datetime.utcnow()
    }
    
    await db.hints.insert_one(hint)

# Leaderboard functions
async def get_leaderboard(time_filter: str = "all-time", category_filter: str = "all"):
    """Get leaderboard data"""
    # For now, return mock data based on user progress
    # In production, this would aggregate data based on filters
    
    pipeline = [
        {
            "$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "id",
                "as": "user"
            }
        },
        {
            "$unwind": "$user"
        },
        {
            "$sort": {"xp": -1}
        },
        {
            "$limit": 100
        }
    ]
    
    cursor = progress_collection.aggregate(pipeline)
    leaderboard = []
    async for entry in cursor:
        leaderboard.append({
            "id": entry["user"]["id"],
            "username": entry["user"]["username"],
            "display_name": entry["user"]["display_name"],
            "level": entry["level"],
            "xp": entry["xp"],
            "completed_quests": len(entry["completed_quests"]),
            "achievements": len(entry["achievements"])
        })
    
    return leaderboard