import os
from typing import Any, Dict, Literal, Required, TypedDict

from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama
from langgraph.graph import END, StateGraph
from pydantic import BaseModel, ValidationError

from app.schemas.request import ItemPayload
from app.schemas.response import ItemResponse

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:14b")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")

DIFICULDADE_MAP = {
    1: "Muito Facil",
    2: "Facil",
    3: "Intermediário",
    4: "Díficil",
    5: "Muito Dificil",
}


class ItemWrapper(BaseModel):
    item: ItemResponse


class S(TypedDict, total=False):
    payload: Required[ItemPayload]
    prompt: str
    draft: str
    item: ItemResponse | None
    attempts: int


def _build_user_prompt(payload) -> str:
    difculdade = DIFICULDADE_MAP.get(payload.dificuldade, f"{payload.dificuldade}")

    return (
        "Gere 1 questão MCQ e devolva EXCLUSIVAMENTE o JSON requerido.\n\n"
        f"Direcionamento: {payload.contexto}\n"
        f"Dificuldade: {difculdade}\n\n"
        "Matriz:\n"
        f"- Função: {payload.matriz.funcao}\n"
        f"- Subfunção: {payload.matriz.subfuncao}\n"
        f"- Categoria: {payload.matriz.competencia_geral}\n"
        f"- Capacidade: {payload.matriz.capacidade}\n"
        f"- Objeto de Conhecimento: {payload.matriz.objeto_conhecimento}\n\n"
        "Regras:\n"
        '1) 5 alternativas A–E; exatamente 1 com "correta": true; demais false.\n'
        "2) Justificativas objetivas (10–35 palavras) para todas as alternativas.\n"
        "3) Distratores plausíveis, cada um errado por motivo distinto, sem deixar pistas óbvias.\n"
        '4) Linguagem pt-BR formal; tamanhos semelhantes; sem pistas; sem "todas/nenhuma".\n'
        "5) Enunciado com situação-estímulo e pergunta clara; comando imperativo coerente.\n"
        "6) JSON estrito, booleans minúsculos, sem campos extras.\n\n"
        "Modelo de saída:\n"
        "{\n"
        '  "item": {\n'
        '    "enunciado": "...",\n'
        '    "comando": "...",\n'
        '    "alternativas": [\n'
        '      { "letra": "A", "texto": "...", "justificativa": "...", "correta": true/false },\n'
        '      { "letra": "B", "texto": "...", "justificativa": "...", "correta": true/false },\n'
        '      { "letra": "C", "texto": "...", "justificativa": "...", "correta": true/false },\n'
        '      { "letra": "D", "texto": "...", "justificativa": "...", "correta": true/false },\n'
        '      { "letra": "E", "texto": "...", "justificativa": "...", "correta": true/false }\n'
        "    ]\n"
        "  }\n"
        "}\n"
    )


def _build_graph(max_attempts: int = 2):
    llm = ChatOllama(
        model=OLLAMA_MODEL,
        base_url=OLLAMA_URL,
        temperature=0.2,
        top_p=0.8,
        top_k=40,
        repeat_penalty=1.15,
    )

    parser = PydanticOutputParser(pydantic_object=ItemWrapper)

    sys = (
        "Gere MCQ em pt-BR. Responda APENAS JSON válido (UTF-8), sem markdown nem texto fora do JSON. "
        'Raiz: "item". Campos: item.enunciado, item.comando, item.alternativas[5]{{letra(A–E),texto,justificativa,correta(true/false)}}. '
        "Exatamente 1 correta=true; demais false. Sem campos extras, sem vírgulas finais. "
        'Se não cumprir, devolva {{"item":{{}}}}.'
    )
    usr = "{prompt}\n{format_instructions}"

    prompt_tpl = ChatPromptTemplate.from_messages(
        [("system", sys), ("user", usr)]
    ).partial(format_instructions=parser.get_format_instructions())

    def build(state: S) -> Dict[str, Any]:
        print("Criando prompt!")
        return {"prompt": _build_user_prompt(state["payload"])}

    def gen(state: S) -> Dict[str, Any]:
        prompt = state.get("prompt", "")
        print("Gerando resposta com prompt: \n", prompt)
        out = (prompt_tpl | llm).invoke({"prompt": prompt})
        print("\nResposta gerada\n")
        return {"draft": out.content, "attempts": state.get("attempts", 0) + 1}

    def validate(state: S) -> Dict[str, Any]:
        draft = state.get("draft") or ""
        try:
            item: ItemWrapper = parser.parse(draft)
            return {"item": item}
        except ValidationError:
            return {"item": None}

    def branch(state: S) -> Literal["retry", "done"]:
        return (
            "retry"
            if (state.get("item") is None and state.get("attempts", 0) < max_attempts)
            else "done"
        )

    g = StateGraph(S)

    g.add_node("build", build)
    g.add_node("gen", gen)
    g.add_node("validate", validate)

    g.set_entry_point("build")
    g.add_edge("build", "gen")
    g.add_edge("gen", "validate")
    g.add_conditional_edges("validate", branch, {"retry": "gen", "done": END})

    return g.compile()


_graph = _build_graph()


async def generate_item(payload: ItemPayload) -> ItemResponse:
    state: S = {"payload": payload, "attempts": 0}

    final = _graph.invoke(state)
    item = final.get("item")

    if item is None:
        raise ValueError("Falha ao gerar item em JSON válido após tentativas.")

    return item
