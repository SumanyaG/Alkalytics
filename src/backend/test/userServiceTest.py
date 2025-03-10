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
    userService.usersCollection.find_one = AsyncMock(return_value=None)
    userService.usersCollection.insert_one = AsyncMock()

    result = await userService.createUser("test@example.com", "password123", "researcher")
    assert result == {"email": "test@example.com", "role": "researcher"}

@pytest.mark.asyncio
async def test_createUser_existingUser(userService):
    userService.usersCollection.find_one = AsyncMock(return_value={"email": "test@example.com"})

    result = await userService.createUser("test@example.com", "password123", "researcher")
    assert result is None

@pytest.mark.asyncio
async def test_validateUser(userService):
    hashed_password = UserService.hashPassword("password123")
    userService.usersCollection.find_one = AsyncMock(return_value={"email": "test@example.com", "hashed_password": hashed_password, "role": "researcher"})

    result = await userService.validateUser("test@example.com", "password123")
    assert result == {"email": "test@example.com", "role": "researcher"}

@pytest.mark.asyncio
async def test_validateUser_wrongPassword(userService):
    hashed_password = UserService.hashPassword("password123")
    userService.usersCollection.find_one = AsyncMock(return_value={"email": "test@example.com", "hashed_password": hashed_password, "role": "researcher"})

    result = await userService.validateUser("test@example.com", "wrongpassword")
    assert result is None

@pytest.mark.asyncio
async def test_getCurrentUserAndRole(userService):
    userService.usersCollection.find_one = AsyncMock(return_value={"email": "test@example.com", "role": "researcher"})

    result = await userService.getCurrentUserAndRole("session_token")
    assert result == {"email": "test@example.com", "role": "researcher"}

@pytest.mark.asyncio
async def test_createSession(userService):
    userService.usersCollection.find_one_and_update = AsyncMock(return_value={"email": "test@example.com", "session_id": "session_token"})

    result = await userService.createSession("test@example.com", "session_token")
    assert result == {"email": "test@example.com", "session_id": "session_token"}

@pytest.mark.asyncio
async def test_endSession(userService):
    userService.usersCollection.find_one_and_update = AsyncMock(return_value={"email": "test@example.com"})

    result = await userService.endSession("session_token")
    assert result is True

@pytest.mark.asyncio
async def test_updatePassword(userService):
    userService.validateUser = AsyncMock(return_value={"email": "test@example.com"})
    userService.usersCollection.update_one = AsyncMock()

    result = await userService.updatePassword("test@example.com", "oldpassword", "newpassword")
    assert result is True

@pytest.mark.asyncio
async def test_updateRole(userService):
    userService.getUser = AsyncMock(return_value={"email": "test@example.com", "role": "researcher"})
    userService.usersCollection.update_one = AsyncMock()

    result = await userService.updateRole("test@example.com", "admin")
    assert result is True

@pytest.mark.asyncio
async def test_deleteUser(userService):
    userService.usersCollection.delete_one = AsyncMock()

    result = await userService.deleteUser("test@example.com")
    assert result is None