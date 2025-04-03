from typing import Dict, List, Optional
from pydantic import BaseModel


class DataAttrs(BaseModel):
    collection: str


class DataFilter(BaseModel):
    collection: str
    attributes: List[str]
    dates: List[str]
    analysis: Optional[bool] = False


class ExperimentFilter(BaseModel):
    collection: str
    attribute: str
    filterValue: str | int | float


class AttributeValues(BaseModel):
    collection: str
    attribute: str


class GeneratedGraphs(BaseModel):
    graphType: str
    data: List[Dict]
    properties: List[Dict]
    attributes: List[str]


class GeneratedGraphRequest(BaseModel):
    latest: Optional[int]


class RemoveGraphRequest(BaseModel):
    graphId: int
