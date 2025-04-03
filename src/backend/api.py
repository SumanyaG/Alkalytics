from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth.router import router as auth_router
from efficiencies.router import router as efficiencies_router
from upload.router import router as upload_router
from table.router import router as table_router
from graph.router import router as graph_router

app = FastAPI(docs_url="/docs")

app.include_router(auth_router)
app.include_router(efficiencies_router)
app.include_router(upload_router)
app.include_router(table_router)
app.include_router(graph_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """
    Basic root endpoint to confirm server is running.
    """
    return {"message": "FastAPI server is working!"}
