from typing import Dict, List
from pydantic import BaseModel


class DataRequest(BaseModel):
    experimentId: str


class UpdateDataPayload(BaseModel):
    updatedData: Dict[str, Dict[str, object]]


class AddColumnRequest(BaseModel):
    columnName: str
    defaultValue: str | int | None = None


class AddRowRequest(BaseModel):
    rowData: dict


class RemoveColumnRequest(BaseModel):
    columnName: str


class RemoveRowRequest(BaseModel):
    experimentIds: List[str]


class SetColumnTypes(BaseModel):
    newColumnTypes: Dict[str, str]
