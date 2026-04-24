import os
from psycopg2.pool import SimpleConnectionPool

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