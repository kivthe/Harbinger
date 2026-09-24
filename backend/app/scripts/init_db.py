from sqlalchemy import text

from app.db.session import engine


def main() -> None:
    with engine.connect() as conn:
        version = conn.scalar(text("SELECT version()"))
        print(f"Connected to: {version}")
    engine.dispose()


if __name__ == "__main__":
    main()