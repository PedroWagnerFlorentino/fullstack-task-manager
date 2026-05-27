from pydantic import BaseModel
class UsuarioCadastro(BaseModel):
    nome: str
    email: str
    senha: str

class UsuarioLogin(BaseModel):
    email: str
    senha: str    

class UsuarioResposta(BaseModel):
    id: int
    nome: str
    email: str

class Tarefa(BaseModel):
    titulo: str
    descricao: str
    concluida: bool
    prazo: str | None = None
    pos_x: float
    pos_y: float
    usuario_id: int

class TarefaUpdate(BaseModel):
    titulo: str | None = None
    descricao: str | None = None
    concluida: bool | None = None
    prazo: str | None = None
    pos_x: float | None = None
    pos_y: float | None = None
    usuario_id: int | None = None

class TarefaRetorno(BaseModel):
    id: int
    titulo: str
    descricao: str
    concluida: bool
    prazo: str | None = None
    pos_x: float
    pos_y: float
    usuario_id: int