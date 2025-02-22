import os
import secrets
from dotenv import load_dotenv
from fastapi import HTTPException, APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from services.userService import UserService

router = APIRouter()

load_dotenv()
mongoUri = os.getenv("CONNECTION_STRING")
dbName = "alkalyticsDB"


class LoginData(BaseModel):
    email: str
    password: str


@router.post("/login")
async def login(req: LoginData):
    userService = UserService(mongoUri, dbName)
    try:
        user = await userService.validateUser(req.email, req.password)
        if user:
            sessionToken = secrets.token_urlsafe(16)
            await userService.createSession(req.email, sessionToken)
            response = JSONResponse(content={
                "status": "success",
                "message": "Logged in successfully",
                "token": sessionToken
            })
            response.set_cookie(
                key="session_id",
                value=sessionToken,
                path="/",
                domain="localhost",
                secure=True,
                samesite='lax'
            )
        else:
            raise HTTPException(
                status_code=401, detail="Invalid credentials"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error logging in: {str(e)}"
        )
    finally:
        await userService.closeConnection()

    return response


class UserModel(BaseModel):
    email: str
    password: str
    role: str


@router.post("/register")
async def register(req: UserModel):
    userService = UserService(mongoUri, dbName)
    try:
        user = await userService.createUser(req.email, req.password, req.role)
        if user:
            response = JSONResponse(content={
                "status": "success",
                "message": "Account created successfully"
            })
        else:
            raise HTTPException(
                status_code=401,
                detail="Account already exists"
            )
    except Exception as e:
        raise e
    finally:
        await userService.closeConnection()
    return response


class UserRequest(BaseModel):
    token: str


@router.post("/auth")
async def getCurrentUser(request: UserRequest):
    sessionToken = request.token
    if not sessionToken:
        raise HTTPException(status_code=401, detail="Not authorized")
    try:
        userService = UserService(mongoUri, dbName)
        user = await userService.getCurrentUserAndRole(sessionToken)
        return JSONResponse(content={
            "email": user["email"],
            "role": user["role"]
        })
    except HTTPException as e:
        raise e
    finally:
        await userService.closeConnection()


@router.post("/logout")
async def logout(request: UserRequest):
    sessionToken = request.token
    if not sessionToken:
        raise HTTPException(status_code=401, detail="Not authorized")
    try:
        userService = UserService(mongoUri, dbName)
        await userService.endSession(sessionToken)
        response = JSONResponse(content={
            "status": "success",
            "message": "Logged out successfully"
        })
        response.delete_cookie("session_id")
        return response
    except HTTPException as e:
        raise e
