from pydantic import BaseModel


class FilePayload(BaseModel):
    filename: str
    mimetype: str
    content: str


class FilesPayload(BaseModel):
    experimentFiles: list[FilePayload]
    dataFiles: list[FilePayload]


class LinkedDataPayload(BaseModel):
    filename: str
    mimetype: str
    content: str
    linkedId: str


class ManualUploadPayload(BaseModel):
    linkedData: list[LinkedDataPayload]
