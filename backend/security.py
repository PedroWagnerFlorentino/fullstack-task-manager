import bcrypt

def gerar_hash_senha(senha):

    senha_bytes = senha.encode("utf-8")

    salt = bcrypt.gensalt()

    hash_senha = bcrypt.hashpw(senha_bytes, salt)
    return hash_senha.decode("utf-8") 

def comparar_senha(senha, hash_senha):
    senha_bytes = senha.encode("utf-8")

    hash_bytes = hash_senha.encode("utf-8")

    return bcrypt.checkpw(senha_bytes, hash_bytes) #Retorna True ou False, se True corresponde, se False Incorrespondente