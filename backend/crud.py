from database import conn, cur
from schemas import UsuarioResposta, TarefaRetorno
from security import gerar_hash_senha

#Usados para cadastro e login
def criar_usuario(usuario):
    senha_hash = gerar_hash_senha(usuario.senha)

    cur.execute(
        "INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s)",
        (usuario.nome, usuario.email, senha_hash)
    )
    conn.commit()

def buscar_usuario_por_email(email):
    cur.execute("SELECT * FROM usuarios WHERE email = %s", (email,))

    usuario = cur.fetchone()

    return usuario #retorna os dados do usuario em lista

def buscar_usuario_por_id(id):
    cur.execute("SELECT * FROM usuarios WHERE id = %s", (id,))
    
    usuario = cur.fetchone()

    if usuario is None:
        return None

    usuario_formatado = UsuarioResposta(
        id=usuario[0],
        nome=usuario[1],
        email=usuario[2]
    )

    return usuario_formatado

#Usados para as tarefas
def criar_tarefa(tarefa):
    try:
        cur.execute(
            """INSERT INTO tarefas
            (titulo, descricao, concluida, prazo, pos_x, pos_y, usuario_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, titulo, descricao, concluida, prazo, pos_x, pos_y, usuario_id
            """,
            (
                tarefa.titulo,
                tarefa.descricao,
                tarefa.concluida,
                tarefa.prazo,
                tarefa.pos_x,
                tarefa.pos_y,
                tarefa.usuario_id
            ))
        conn.commit()
        return cur.fetchone()
    except Exception as e:
        conn.rollback()
        raise e

def update_tarefa(id, tarefa):
    try:
        campos = []
        valores = []

        if tarefa.concluida is not None:
            campos.append("concluida = %s")
            valores.append(tarefa.concluida)
        if tarefa.pos_x is not None:
            campos.append("pos_x = %s")
            valores.append(tarefa.pos_x)
        if tarefa.pos_y is not None:
            campos.append("pos_y = %s")
            valores.append(tarefa.pos_y)


        cur.execute(
            f"""
            UPDATE tarefas
            SET {', '.join(campos)}
            WHERE id = %s
            """,
            tuple(valores) + (id,)
        )
        conn.commit()
        return cur.rowcount
    except Exception as e:
        conn.rollback()
        raise e

def deletar_tarefa(id):
    try:
        cur.execute(
            "DELETE FROM tarefas WHERE id = %s", 
            (id,)
        )
        conn.commit()
        return cur.rowcount
    except Exception as e:
        conn.rollback()
        raise e

def listar_tarefas(usuario_id):
    try:    
        cur.execute(
            "SELECT * FROM tarefas WHERE usuario_id = %s",
            (usuario_id,)
        )
        tarefas = cur.fetchall()

        tarefas_formatadas = []
        for tarefa in tarefas:
            tarefas_formatadas.append(TarefaRetorno(
                id= tarefa[0],
                titulo= tarefa[1],
                descricao= tarefa[2],
                concluida= tarefa[3],
                prazo= tarefa[4].strftime("%Y-%m-%d") if tarefa[4] else None,
                pos_x= tarefa[5],
                pos_y= tarefa[6],
                usuario_id= tarefa[7]
            ))
        return tarefas_formatadas
    except Exception as e:
        conn.rollback()
        raise e