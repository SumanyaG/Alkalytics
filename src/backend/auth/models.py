from pydantic import BaseModel


class LoginData(BaseModel):
    email: str
    password: str


class UserModel(BaseModel):
    email: str
    password: str
    role: str


class UserRequest(BaseModel):
    token: str
