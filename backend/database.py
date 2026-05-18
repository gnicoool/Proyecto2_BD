import os
import psycopg2
from psycopg2.pool import SimpleConnectionPool
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

_pool: SimpleConnectionPool | None = None

def init_pool():
    global _pool

    database_url = os.getenv("DATABASE_URL")

    if database_url:
        _pool = SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=database_url
        )
    else:
        _pool = SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
        )

def close_pool():
    global _pool
    if _pool:
        _pool.closeall()


def get_pool() -> SimpleConnectionPool:
    if _pool is None:
        raise RuntimeError("Database pool not initialized")
    return _pool


@contextmanager
def explicit_transaction():
    """
    Funcion para manejo de transacciones.
    """
    conn = _pool.getconn()
    conn.autocommit = False
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        _pool.putconn(conn)


@contextmanager
def get_db():
    with explicit_transaction() as cur:
        yield cur