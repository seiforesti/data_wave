from sqlalchemy.orm import Session
from app.models.auth_models import Resource
from typing import Optional, List

def get_resource_ancestors(db: Session, resource_id: int) -> List[Resource]:
    """
    Efficiently fetch all ancestors of a resource using a recursive CTE (if supported by the DB),
    otherwise fallback to Python recursion. Returns a list from closest parent up to the root.
    """
    from sqlalchemy import text
    # Try recursive CTE (works for PostgreSQL, SQLite 3.8.3+, etc.)
    try:
        sql = text('''
            WITH RECURSIVE ancestors(id, name, type, parent_id, engine, details) AS (
                SELECT id, name, type, parent_id, engine, details FROM resources WHERE id = :rid
                UNION ALL
                SELECT r.id, r.name, r.type, r.parent_id, r.engine, r.details
                FROM resources r
                JOIN ancestors a ON r.id = a.parent_id
            )
            SELECT id, name, type, parent_id, engine, details FROM ancestors WHERE id != :rid;
        ''')
        rows = db.execute(sql, {"rid": resource_id}).fetchall()
        # Convert to Resource objects (if needed)
        return [Resource(**dict(row)) for row in rows]
    except Exception:
        # Fallback to Python recursion
        ancestors = []
        current = db.query(Resource).filter(Resource.id == resource_id).first()
        while current and current.parent_id:
            parent = db.query(Resource).filter(Resource.id == current.parent_id).first()
            if not parent:
                break
            ancestors.append(parent)
            current = parent
        return ancestors

def get_resource_descendants(db: Session, resource_id: int) -> List[Resource]:
    """
    Efficiently fetch all descendants of a resource using a recursive CTE (if supported by the DB),
    otherwise fallback to Python recursion. Returns a flat list of all descendants.
    """
    from sqlalchemy import text
    try:
        sql = text('''
            WITH RECURSIVE descendants(id, name, type, parent_id, engine, details) AS (
                SELECT id, name, type, parent_id, engine, details FROM resources WHERE parent_id = :rid
                UNION ALL
                SELECT r.id, r.name, r.type, r.parent_id, r.engine, r.details
                FROM resources r
                JOIN descendants d ON r.parent_id = d.id
            )
            SELECT id, name, type, parent_id, engine, details FROM descendants;
        ''')
        rows = db.execute(sql, {"rid": resource_id}).fetchall()
        return [Resource(**dict(row)) for row in rows]
    except Exception:
        descendants = []
        def recurse(rid):
            children = db.query(Resource).filter(Resource.parent_id == rid).all()
            for child in children:
                descendants.append(child)
                recurse(child.id)
        recurse(resource_id)
        return descendants
