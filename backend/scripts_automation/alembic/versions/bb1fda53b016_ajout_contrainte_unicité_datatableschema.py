"""Ajout contrainte unicité datatableschema

Revision ID: bb1fda53b016
Revises: add_datasensitivitylabel_column
Create Date: 2025-06-17 16:29:34.073056

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'bb1fda53b016'
down_revision: Union[str, None] = 'add_datasensitivitylabel_column'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_sessions_session_token'), table_name='sessions')
    op.drop_table('sessions')
    op.drop_table('schemaversion')
    op.drop_table('datatableschema')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.drop_index(op.f('ix_email_verification_codes_email'), table_name='email_verification_codes')
    op.drop_table('email_verification_codes')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('email_verification_codes',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('email', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('code', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.Column('expires_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('email_verification_codes_pkey'))
    )
    op.create_index(op.f('ix_email_verification_codes_email'), 'email_verification_codes', ['email'], unique=False)
    op.create_table('users',
    sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('users_id_seq'::regclass)"), autoincrement=True, nullable=False),
    sa.Column('email', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('hashed_password', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('is_active', sa.BOOLEAN(), autoincrement=False, nullable=False),
    sa.Column('is_verified', sa.BOOLEAN(), autoincrement=False, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.Column('mfa_enabled', sa.BOOLEAN(), autoincrement=False, nullable=False),
    sa.Column('mfa_secret', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', name='users_pkey'),
    postgresql_ignore_search_path=False
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_table('datatableschema',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('database_type', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('table_name', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('column_name', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('data_type', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('nullable', sa.BOOLEAN(), autoincrement=False, nullable=False),
    sa.Column('categories', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.Column('datasensitivitylabel', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', name=op.f('datatableschema_pkey'))
    )
    op.create_table('schemaversion',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('source', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('version_id', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('database_type', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('extracted_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('schemaversion_pkey'))
    )
    op.create_table('sessions',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('session_token', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.Column('expires_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('sessions_user_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('sessions_pkey'))
    )
    op.create_index(op.f('ix_sessions_session_token'), 'sessions', ['session_token'], unique=True)
    # ### end Alembic commands ###
