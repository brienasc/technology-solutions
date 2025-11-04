from datetime import datetime
from typing import Any, List

from pydantic import BaseModel, Field, ValidationError, model_validator


class Alternativa(BaseModel):
    letra: str
    texto: str
    justificativa: str
    correta: bool


class ItemResponse(BaseModel):
    comando: str
    enunciado: str
    alternativas: List[Alternativa]

    @model_validator(mode="after")
    def _one_correct(self):
        if sum(1 for a in self.alternativas if a.correta) != 1:
            raise ValidationError("exatamente uma alternativa correta")
        return self


class Response(BaseModel):
    status: int
    message: str
    timestamp: datetime = Field(default_factory=datetime.now)
    data: ItemResponse | List | None | Any
