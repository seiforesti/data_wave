### === backend/app/services/extractor.py ===
from sqlalchemy import create_engine, inspect


def extract_db_schema(db_url: str):
    engine = create_engine(db_url)
    inspector = inspect(engine)
    result = []
    for table_name in inspector.get_table_names():
        columns = inspector.get_columns(table_name)
        result.append({
            "table": table_name,
            "columns": [{"name": col["name"], "type": str(col["type"])} for col in columns]
        })
    return {"tables": result}