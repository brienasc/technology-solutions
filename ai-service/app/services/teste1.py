import json
import os

import ollama
from dotenv import load_dotenv

from app.schemas.prompt import OllamaPrompt
from app.schemas.request import ItemPayload

load_dotenv()

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:14b")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")

DIFICULDADE_MAP = {
    1: "Muito Facil",
    2: "Facil",
    3: "Intermediário",
    4: "Díficil",
    5: "Muito Dificil",
}

client = ollama.AsyncClient(host=OLLAMA_URL)

system_prompt = (
    "Você é um gerador de itens de prova (MCQ) em pt-BR.\n"
    "Responda SOMENTE com um JSON válido (UTF-8, sem BOM), sem markdown, sem explicações e sem texto fora do JSON.\n"
    'A raiz do JSON deve ser a chave única "item".\n'
    "Campos permitidos e apenas estes:\n"
    "- item.enunciado: string\n"
    "- item.comando: string\n"
    "- item.alternativas: array com 5 objetos exatamente, letras A–E, cada objeto com:\n"
    '  - letra: "A" | "B" | "C" | "D" | "E"\n'
    "  - texto: string\n"
    "  - justificativa: string\n"
    "  - correta: true | false (minúsculo)\n"
    "Restrições rígidas:\n"
    '  - Exatamente 1 alternativa com "correta": true; as demais, false.\n'
    "  - Sem campos extras, sem vírgulas finais, aspas balanceadas, sem caracteres de controle.\n"
    '  - Não insira campo "contexto".\n'
    'Se não for possível cumprir integralmente, devolva {"item":{}}.'
)


def build_prompt(payload: ItemPayload) -> OllamaPrompt:
    contexto_adicional = ""
    if payload.contexto:
        contexto_adicional = f"Contexto adicional (pré-prompt):\n{payload.contexto}\n\n"

    difculdade = DIFICULDADE_MAP.get(payload.dificuldade, f"{payload.dificuldade}")

    user_prompt = f"""
        Gere exatamente 1 questão de múltipla escolha (MCQ) em pt-BR e devolva EXCLUSIVAMENTE um JSON válido conforme o modelo ao final.
        Não escreva nada além do JSON. Não use markdown. Não adicione comentários.

        {contexto_adicional}

        Contexto pedagógico (parâmetros da matriz):
            - Função: {payload.matriz.funcao}
            - Competência Geral: {payload.matriz.competencia_geral}
            - Subfunção: {payload.matriz.subfuncao}
            - Capacidade: {payload.matriz.capacidade}
            - Objeto de Conhecimento: {payload.matriz.objeto_conhecimento}

        Nível de dificuldade = {difculdade}.

        Diretrizes obrigatórias:
            1) Formato MCQ com 5 alternativas (A–E).
            2) Exatamente 1 alternativa deve ter "correta": true; as demais "correta": false. Distribua a posição da correta aleatoriamente.
            3) TODAS as alternativas devem ter "justificativa" breve e objetiva explicando por que estão corretas ou incorretas.
            4) Distratores semanticamente variados: cada um errado por MOTIVO distinto (conceito faltante, confusão comum, condição faltante, generalização indevida, procedimento metodológico inválido).
            5) Evite pistas gramaticais/semânticas: tamanhos semelhantes e vocabulário consistente; evite absolutos como "sempre/nunca" salvo necessidade técnica.
            6) O enunciado deve ser uma PERGUNTA clara que exija aplicar a capacidade "{payload.matriz.capacidade}" sobre o objeto "{payload.matriz.objeto_conhecimento}".
            7) Linguagem: pt-BR formal, precisa e objetiva; sem ambiguidade.
            8) A alternativa correta deve alinhar-se explicitamente à capacidade e ao objeto; justificativas logicamente consistentes.
            9) Proibição: não inclua fontes, URLs, nomes próprios desnecessários, datas ou números específicos que sirvam de pista; não repita frases do enunciado nas alternativas.
            10) JSON estrito: sem vírgulas finais, sem campos extras; booleans em minúsculas (true/false).
            11) Enunciado com “situação-estímulo”: apresente, em 1–2 parágrafos, um contexto (curto ou longo) que motive a questão, podendo conter trechos, descrições, dados ou cenários; finalize em “?”.
            12) O enunciado deve levar o estudante a aplicar a capacidade "{payload.matriz.capacidade}" no objeto "{payload.matriz.objeto_conhecimento}".
            13) Comando no imperativo claro e coerente com o enunciado (ex.: "Identifique…", "Relacione…", "Selecione…"); não introduza requisitos fora do enunciado.
            14) Não crie campo "contexto"; toda contextualização deve estar apenas em "enunciado".
            15) Alternativas com 12–28 palavras e variação de comprimento ≤ 20% entre si.
            16) Cada alternativa apresenta uma ideia principal; evite compostos “A e B”, “exceto se…”.
            17) Distratores plausíveis e tecnicamente críveis; cada um erra por motivo distinto explicitado na justificativa.
            18) Sem “todas as anteriores/nenhuma das anteriores”.
            19) Terminologia precisa e consistente; mantenha uma forma preferida para sinônimos.
            20) Justificativas entre 10–35 palavras, ancoradas em critério verificável (ex.: relação causal, evidência empírica, procedimento, período, técnica, definição operacional), sem repetir frases do enunciado.
            21) Manter pessoa, tempo verbal e pontuação homogêneos entre alternativas; não use estilo técnico apenas na correta.
            22) Respeite o recorte temporal/espacial do enunciado; não desloque o fenômeno em alternativas.
            23) Evite números “mágicos” ou detalhes exclusivos na correta; use apenas se indispensáveis ao raciocínio avaliado.
            24) Garante-se unicidade: exatamente uma alternativa defensável à luz do enunciado e dos parâmetros da matriz.

        Apenas UMA Alternativa Deve Estar Correta!

        Modelo de saída (retorne APENAS o JSON abaixo):
        {{
            "item": {{
                "enunciado": "...",
                "comando": "...",
                "alternativas": [
                    {{ "letra": "A", "texto": "...", "justificativa": "...", "correta": true/false }},
                    {{ "letra": "B", "texto": "...", "justificativa": "...", "correta": true/false }},
                    {{ "letra": "C", "texto": "...", "justificativa": "...", "correta": true/false }},
                    {{ "letra": "D", "texto": "...", "justificativa": "...", "correta": true/false }},
                    {{ "letra": "E", "texto": "...", "justificativa": "...", "correta": true/false }}
                ]
            }}
        }}
    """.strip()

    prompt_obj = OllamaPrompt(
        model=OLLAMA_MODEL,
        system=system_prompt,
        prompt=user_prompt,
    )

    return prompt_obj


async def send(prompt):
    try:
        res = await client.generate(
            options={
                "temperature": 0.2,
                "top_p": 0.8,
                "top_k": 40,
                "repeat_penalty": 1.15,
                "mirostat": 0,
                "num_ctx": 4096,
                "num_predict": 420,
                "seed": 42,
            },
            format="json",
            model=prompt.model,
            system=prompt.system,
            prompt=prompt.prompt,
        )

        raw = res.model_dump(mode="json")["response"]
        obj = json.loads(raw)

        return obj
    except Exception as e:
        raise Exception(f"error ollama requesting: {e}")


async def send_prompt(payload: ItemPayload):
    prompt = build_prompt(payload)
    res = await send(prompt)

    return {"item": res}
