from database import conn, cur

cur.execute("""
            CREATE TABLE IF NOT EXISTS usuarios(
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100),
            email VARCHAR(150) UNIQUE,
            senha VARCHAR(255))
            """)
cur.execute("""
            CREATE TABLE IF NOT EXISTS tarefas(
            id SERIAL PRIMARY KEY,
            titulo VARCHAR(200),
            descricao TEXT,
            concluida BOOLEAN DEFAULT FALSE,
            prazo TIMESTAMP,
            pos_x FLOAT,
            pos_y FLOAT,
            usuario_id INTEGER,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id))
            """)

conn.commit()