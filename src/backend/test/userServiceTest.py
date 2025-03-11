import pytest
import pytest_asyncio

from unittest.mock import AsyncMock, patch
from services.userService import UserService

@pytest_asyncio.fixture
async def userService():
    with patch('services.userService.AsyncIOMotorClient') as mockClient:
        mockDB = mockClient.return_value
        mockDB.__getitem__.return_value = mockDB
        mockDB.users = mockDB
        service = UserService("mongodb://localhost:27017", "test_db")
        yield service

@pytest.mark.asyncio
async def test_createUser_newUser(userService):
    """
    Test createUser for a new user.
    Verifies that a new user is created successfully in the database.
    """
    userService.usersCollection.find_one = AsyncMock(return_value=None)
    userService.usersCollection.insert_one = AsyncMock()

    result = await userService.createUser("test@example.com", "password123", "researcher")
    assert result == {"email": "test@example.com", "role": "researcher"}

@pytest.mark.asyncio
async def test_createUser_existingUser(userService):
    """
    Test createUser for an existing user.
    Ensures that creating an existing user returns None.
    """
    userService.usersCollection.find_one = AsyncMock(return_value={"email": "test@example.com"})

    result = await userService.createUser("test@example.com", "password123", "researcher")
    assert result is None

@pytest.mark.asyncio
async def test_validateUser(userService):
    """
    Test validateUser when password is correct.
    Checks if a user is validated correctly with the correct password.
    """
    hashed_password = UserService.hashPassword("password123")
    userService.usersCollection.find_one = AsyncMock(return_value={"email": "test@example.com", "hashed_password": hashed_password, "role": "researcher"})

    result = await userService.validateUser("test@example.com", "password123")
    assert result == {"email": "test@example.com", "role": "researcher"}

@pytest.mark.asyncio
async def test_validateUser_wrongPassword(userService):
    """
    Test validateUser password is incorrect.
    Confirms that validation fails with an incorrect password.
    """
    hashed_password = UserService.hashPassword("password123")
    userService.usersCollection.find_one = AsyncMock(return_value={"email": "test@example.com", "hashed_password": hashed_password, "role": "researcher"})

    result = await userService.validateUser("test@example.com", "wrongpassword")
    assert result is None

@pytest.mark.asyncio
async def test_getCurrentUserAndRole(userService):
    """
    Test getCurrentUserAndRole retrieves the current user's email and role.
    Validates retrieval of the current user's email and role.
    """
    userService.usersCollection.find_one = AsyncMock(return_value={"email": "test@example.com", "role": "researcher"})

    result = await userService.getCurrentUserAndRole("session_token")
    assert result == {"email": "test@example.com", "role": "researcher"}

@pytest.mark.asyncio
async def test_createSession(userService):
    """
    Test createSession adds session information for a user.
    Verifies that a session is created successfully for the user.
    """
    userService.usersCollection.find_one_and_update = AsyncMock(return_value={"email": "test@example.com", "session_id": "session_token"})

    result = await userService.createSession("test@example.com", "session_token")
    assert result == {"email": "test@example.com", "session_id": "session_token"}

@pytest.mark.asyncio
async def test_endSession(userService):
    """
    Test endSession removes session information for a user.
    Ensures that ending a session returns True.
    """
    userService.usersCollection.find_one_and_update = AsyncMock(return_value={"email": "test@example.com"})

    result = await userService.endSession("session_token")
    assert result is True

@pytest.mark.asyncio
async def test_updatePassword(userService):
    """
    Test updatePassword updates a user's password.
    Verifies that a user's password is updated successfully.
    """
    userService.validateUser = AsyncMock(return_value={"email": "test@example.com"})
    userService.usersCollection.update_one = AsyncMock()

    result = await userService.updatePassword("test@example.com", "oldpassword", "newpassword")
    assert result is True

@pytest.mark.asyncio
async def test_updateRole(userService):
    """
    Test updateRole updates a user's role.
    Checks if a user's role is updated correctly.
    """
    userService.getUser = AsyncMock(return_value={"email": "test@example.com", "role": "researcher"})
    userService.usersCollection.update_one = AsyncMock()

    result = await userService.updateRole("test@example.com", "admin")
    assert result is True

@pytest.mark.asyncio
async def test_deleteUser(userService):
    """
    Test deleteUser deletes an existing user.
    Confirms that deleting a user returns None.
    """
    userService.usersCollection.delete_one = AsyncMock()

    result = await userService.deleteUser("test@example.com")
    assert result is None

@pytest.mark.asyncio
async def test_deleteUser_nonExistentUser(userService):
    """
    Test deleteUser when user doesn't exist.
    Ensures that attempting to delete a non-existent user returns None.
    """
    userService.usersCollection.delete_one = AsyncMock(return_value=None)

    result = await userService.deleteUser("nonexistent@example.com")
    assert result is None