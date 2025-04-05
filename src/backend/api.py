from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth.router import router as authRouter
from efficiencies.router import router as efficienciesRouter
from upload.router import router as uploadRouter
from table.router import router as tableRouter
from graph.router import router as graphRouter

app = FastAPI(docs_url="/docs")

app.include_router(authRouter)
app.include_router(efficienciesRouter)
app.include_router(uploadRouter)
app.include_router(tableRouter)
app.include_router(graphRouter)

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
