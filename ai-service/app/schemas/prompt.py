from pydantic import BaseModel


class OllamaPrompt(BaseModel):
    model: str
    format: str = "json"
    system: str
    prompt: str
