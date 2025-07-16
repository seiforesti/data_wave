### === backend/app/services/glossary.py ===
from pyapacheatlas.core import PurviewClient
from pyapacheatlas.core.glossary import AtlasGlossaryTerm
from app.core.config import settings
from app.core.security import get_auth


def create_glossary_terms(payload: dict):
    glossary_name = payload.get("glossaryName", "PurSightGlossary")
    terms_data = payload.get("terms", [])

    terms = []
    for term in terms_data:
        terms.append(
            AtlasGlossaryTerm(
                name=term["name"],
                glossaryName=glossary_name,
                shortDescription=term.get("description", ""),
                longDescription=term.get("description", "")
            )
        )

    client = PurviewClient(
        account_name=settings.PURVIEW_NAME,
        authentication=get_auth()
    )

    result = client.upload_glossary_terms(terms)
    return {"glossary_upload_result": result}
