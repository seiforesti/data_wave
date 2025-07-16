from typing import List
from app.api.classifiers.regex_classifier import RegexClassifier
from app.api.classifiers.dictionary_classifier import DictionaryClassifier
# from app.api.classifiers.ai_classifier import ai_classify
from app.services.data_sensitivity_service import assign_data_sensitivity_label
from app.db_session import get_session
from app.models.schema_models import DataTableSchema

classifier_regex = RegexClassifier()
classifier_dict = DictionaryClassifier()
# classifier_ai = ai_classify()  # Assuming ai_classify is a function that returns a list of categories

def classify_all(column_name: str) -> List[str]:
    categories = set()
    categories.update(classifier_regex.classify(column_name))
    categories.update(classifier_dict.classify(column_name))   # à implémenter plus tard
    # categories.update(classifier_ai.classify(column_name))      # idem
    return list(categories)

def classify_and_assign_sensitivity(session: get_session, column: DataTableSchema):
    # Classify the column to get categories
    classification_categories = classify_all(column.column_name)
    # Assign categories to the column
    column.categories = ", ".join(classification_categories)
    session.add(column)
    session.commit()
    # Assign data sensitivity label based on categories
    sensitivity_label = assign_data_sensitivity_label(session, column)
    session.commit()
    return sensitivity_label
