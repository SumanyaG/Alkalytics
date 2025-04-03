from typing import List
from pydantic import BaseModel


class EfficiencyRequest(BaseModel):
    experimentId: str
    selectedEfficiencies: List[str]
    timeInterval: int
