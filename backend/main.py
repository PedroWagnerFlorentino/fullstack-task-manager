from fastapi import FastAPI, HTTPException
from security import comparar_senha
from schemas import UsuarioCadastro, UsuarioLogin, Tarefa, TarefaUpdate
from fastapi.middleware.cors import CORSMiddleware

from crud import criar_usuario, buscar_usuario_por_id, buscar_usuario_por_email, criar_tarefa, update_tarefa, deletar_tarefa, listar_tarefas

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "API funcionando"}

@app.post("/cadastro")
def adicionar_usuario(usuario: UsuarioCadastro):
    criar_usuario(usuario)

    return {"message": "Usuário Criado!"}

@app.post("/login")
def autenticar_login(login: UsuarioLogin):
    usuario = buscar_usuario_por_email(login.email) 
    
    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="Email ou senha inválidos"
        )
    
    senha_correta = comparar_senha(login.senha, usuario[3]) #usuario 3 é a 4 coluna do banco de dados ontem esta o hash de senha do usurio

    if not senha_correta:
        raise HTTPException(
            status_code=404,
            detail="Email ou senha inválidos"
        )
    
    return {
        "id": usuario[0],
        "message": "Login executado com sucesso"
    }

@app.get("/usuarios/{id}")
def buscar_usuario(id: int):
    usuario = buscar_usuario_por_id(id)

    if usuario is None:
        raise HTTPException(
            status_code= 404,
            detail="Usuário não encontrado"
        )

    return usuario

#SISTEMA DE TAREFAS
@app.get("/tarefas/buscar/{usuario_id}")
def listar_tarefas_usuario(usuario_id: int):
    tarefas = listar_tarefas(usuario_id)
    return tarefas

@app.post("/tarefas")
def cadastrar_tarefa(tarefa: Tarefa):
    tarefa = criar_tarefa(tarefa)
    return{
        "id":         tarefa[0],
        "titulo":     tarefa[1],
        "descricao":  tarefa[2],
        "concluida":  tarefa[3],
        "prazo":      tarefa[4],
        "pos_x":      tarefa[5],
        "pos_y":      tarefa[6],
        "usuario_id": tarefa[7],
        "message": "Tarefa criada"
        }
    
@app.patch("/tarefas/{id}")
def atualizar_tarefa(id: int, tarefa: TarefaUpdate):
    linhas_afetadas = update_tarefa(id, tarefa)
    if linhas_afetadas == 0:
        raise HTTPException(
            status_code=404,
            detail="Tarefa não encontrada"
        )
    return{"message": "Tarefa atualizada"}

@app.delete("/tarefas/{id}")
def remover_tarefa(id: int):
    linhas_afetadas = deletar_tarefa(id)
    if linhas_afetadas == 0:
        raise HTTPException(
            status_code=404,
            detail="Tarefa não encontrada"
        )
    return {"message": "Tarefa deletada"}

