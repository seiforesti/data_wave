import pandas as pd

from app.db_session import get_session
from app.models.schema_models import DataTableSchema



def export_schema_to_csv():
    with get_session() as session:
        data = session.exec()(DataTableSchema).all()
        df = pd.DataFrame([d.dict() for d in data])
        df.to_csv("schema_export.csv", index=False)
        return "✅ Exported to schema_export.csv"