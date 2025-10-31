from datetime import datetime

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.schemas.request import ItemPayload
from app.schemas.response import Response
from app.services import model

app = FastAPI()
app.title = "AIPIC"

ALLOWED_ORIGINS = [
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc: RequestValidationError):
    error_list = []
    for error in exc.errors():
        field_name = error["loc"][-1] if len(error["loc"]) > 1 else "body"
        error_list.append({"field": field_name, "message": error["msg"]})

    res = Response(
        status=400, message="Bad request", data=error_list, timestamp=datetime.now()
    ).model_dump(mode="json")

    return JSONResponse(status_code=422, content=res)


@app.get("/", tags=["root"])
def root():
    return {"API started sucessful"}


@app.post("/ai/create", tags=["item"])
async def create_item(payload: ItemPayload):
    try:
        res = await model.generate_item(payload)
        return Response(status=200, message="Item criado com sucesso!", data=res)
    except Exception as e:
        print(e)
        err = Response(status=400, message="Bad request", data=[f"{e}"]).model_dump(
            mode="json"
        )

        return JSONResponse(status_code=400, content=err)
