import bcrypt
import logging
from motor.motor_asyncio import AsyncIOMotorClient


class UserService:
    """
    Service class for handling user information in MongoDB and enable Role-
    Based Access Control.
    """
    def __init__(self, mongoUri, dbName):
        """
        Initialize the service with MongoDB connection details.
        """
        self.client = AsyncIOMotorClient(mongoUri)
        self.db = self.client[dbName]

        self.usersCollection = self.db["users"]

    @staticmethod
    def hashPassword(password: str) -> str:
        bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(bytes, salt).decode('utf-8')

    async def createUser(self, email: str, password: str, role: str) -> dict:
        """
        Check if a user with input email already exists.
        If not, create a new user and add them to the database.
        """
        if await self.usersCollection.find_one({"email": email}):
            logging.error(
                f"An account with email {email} already exists."
            )
            return None

        hashedPassword = UserService.hashPassword(password)
        newUser = {
            "email": email,
            "hashed_password": hashedPassword,
            "role": role,
            "session_id": ""
        }
        try:
            await self.usersCollection.insert_one(newUser)
            logging.info(
                f"Account with email {email} successfully created."
            )
            return {
                "email": email,
                "role": role
            }
        except Exception as e:
            logging.error(
                f"Error creating your account: {e}"
            )
            return None

    async def validateUser(self, email: str, password: str) -> dict:
        """
        Validate login request by checking if account exists and verifying
        password.
        """
        user = await self.usersCollection.find_one({"email": email})

        if not user:
            logging.error(
                f"Account with email {email} does not exist."
            )
            return None

        if bcrypt.checkpw(
            password.encode('utf-8'),
            user["hashed_password"].encode('utf-8')
        ):
            return {
                "email": user["email"],
                "role": user["role"]
            }

        logging.error(
            "Password does not match."
        )
        return None

    async def getCurrentUserAndRole(self, sessionToken: str) -> dict:
        """
        Fetch the current user's email and role from the database.
        """
        user = await self.usersCollection.find_one(
            {"session_id": sessionToken}
        )
        if user:
            return {
                "email": user["email"],
                "role": user["role"]
            }
        logging.error(
            "Session token not found."
        )
        return None

    async def createSession(self, email: str, sessionToken: str) -> dict:
        user = await self.usersCollection.find_one_and_update(
            {"email": email},
            {"$set": {"session_id": sessionToken}}
        )
        if not user:
            logging.error(
                "Session token not found."
            )
            return None
        return user

    async def endSession(self, sessionToken: str) -> bool:
        """
        Remove active sessionToken from a user document.
        """
        user = await self.usersCollection.find_one_and_update(
                {"session_id": sessionToken},
                {"$unset": {"session_id": ""}}
            )
        if not user:
            logging.error(
                "Session token not found."
            )
            return False
        return True

    async def updatePassword(
        self, email: str, oldPassword: str, newPassword: str
    ) -> bool:
        user = await self.validateUser(email, oldPassword)

        if not user:
            logging.error(
                f"Account with email {email} does not exist."
            )
            return False

        hashedPassword = UserService.hashPassword(newPassword)
        try:
            self.usersCollection.update_one(
                {"email": email},
                {"$set": {"hashed_password": hashedPassword}}
            )
            return True
        except Exception as e:
            logging.error(
                f"Error changing your password: {e}"
            )
            return False

    async def updateRole(self, email: str, newRole: str):
        user_data = await self.getUser(email)
        if not user_data:
            logging.error(
                f"Account with email {email} does not exist."
            )
            return False

        oldRole = user_data["role"]

        if oldRole == newRole:
            logging.error(
                f"Already authorized as {oldRole}"
            )
            return False

        try:
            await self.usersCollection.update_one(
                {"email": email},
                {"$set": {"role": newRole}}
            )
            return True
        except Exception as e:
            logging.error(f"Error updating your role: {e}")
            return False

    async def deleteUser(self, email: str):
        try:
            await self.usersCollection.delete_one(
                {"email": email}
            )
        except Exception as e:
            logging.error(f"Error deleting user: {e}")
            return False

    async def closeConnection(self):
        """Close the MongoDB client connection."""
        self.client.close()
