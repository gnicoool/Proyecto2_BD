import os
import psycopg2
from psycopg2.pool import SimpleConnectionPool
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

_pool: SimpleConnectionPool | None = None


def init_pool():
    global _pool
    host = (os.getenv("DB_HOST") or "db").strip() or "db"
    port = int((os.getenv("DB_PORT") or "5432").strip() or "5432")
    _pool = SimpleConnectionPool(
        minconn=1,
        maxconn=10,
        host=host,
        port=port,
        dbname=os.getenv("DB_NAME", "postgres"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
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