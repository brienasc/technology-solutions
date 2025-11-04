from pydantic import BaseModel, Field


class Matriz(BaseModel):
    competencia_geral: str
    funcao: str
    subfuncao: str
    capacidade: str
    objeto_conhecimento: str


class ItemPayload(BaseModel):
    dificuldade: int = Field(ge=1, le=5)
    contexto: str | None = None
    matriz: Matriz
