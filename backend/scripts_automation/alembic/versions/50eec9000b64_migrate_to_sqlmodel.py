"""Migrate to SQLModel

Revision ID: 50eec9000b64
Revises: 20250630_advanced_rbac_condition_template
Create Date: 2025-07-04 18:06:20.937283

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '50eec9000b64'
down_revision: Union[str, None] = '20250630_advanced_rbac_condition_template'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_sessions_session_token'), table_name='sessions')
    op.drop_table('sessions')
    op.drop_table('role_permissions_old')
    op.drop_table('deny_assignments')
    op.drop_table('user_groups')
    op.drop_table('user_roles')
    op.drop_index(op.f('ix_rbac_audit_logs_correlation_id'), table_name='rbac_audit_logs')
    op.drop_index(op.f('ix_rbac_audit_logs_entity_id'), table_name='rbac_audit_logs')
    op.drop_index(op.f('ix_rbac_audit_logs_entity_type'), table_name='rbac_audit_logs')
    op.drop_table('rbac_audit_logs')
    op.drop_table('group_roles')
    op.drop_table('datatableschema')
    op.drop_table('access_requests')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.drop_table('role_inheritance')
    op.drop_index(op.f('ix_groups_name'), table_name='groups')
    op.drop_table('groups')
    op.drop_index(op.f('ix_email_verification_codes_email'), table_name='email_verification_codes')
    op.drop_table('email_verification_codes')
    op.drop_index(op.f('ix_resources_name'), table_name='resources')
    op.drop_index(op.f('ix_resources_type'), table_name='resources')
    op.drop_table('resources')
    op.drop_table('role_permissions')
    op.drop_index(op.f('ix_roles_name'), table_name='roles')
    op.drop_table('roles')
    op.drop_table('schemaversion')
    op.drop_table('resource_roles')
    op.drop_index(op.f('ix_permissions_action'), table_name='permissions')
    op.drop_index(op.f('ix_permissions_resource'), table_name='permissions')
    op.drop_table('permissions')
    op.drop_index(op.f('ix_condition_templates_label'), table_name='condition_templates')
    op.drop_table('condition_templates')
    op.alter_column('label_audits', 'proposal_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.alter_column('label_audits', 'note',
               existing_type=sa.TEXT(),
               type_=sqlmodel.sql.sqltypes.AutoString(),
               existing_nullable=True)
    op.alter_column('label_proposals', 'label_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.alter_column('label_proposals', 'justification',
               existing_type=sa.TEXT(),
               type_=sqlmodel.sql.sqltypes.AutoString(),
               existing_nullable=True)
    op.alter_column('label_proposals', 'status',
               existing_type=postgresql.ENUM('proposed', 'approved', 'rejected', 'expired', name='labelstatus'),
               nullable=False)
    op.alter_column('label_reviews', 'proposal_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.alter_column('label_reviews', 'review_status',
               existing_type=postgresql.ENUM('proposed', 'approved', 'rejected', 'expired', name='labelstatus_review'),
               type_=sa.Enum('PROPOSED', 'APPROVED', 'REJECTED', 'EXPIRED', name='labelstatus'),
               nullable=False)
    op.alter_column('label_reviews', 'review_note',
               existing_type=sa.TEXT(),
               type_=sqlmodel.sql.sqltypes.AutoString(),
               existing_nullable=True)
    op.add_column('lineage_edges', sa.Column('source_type', sqlmodel.sql.sqltypes.AutoString(), nullable=False))
    op.add_column('lineage_edges', sa.Column('target_type', sqlmodel.sql.sqltypes.AutoString(), nullable=False))
    op.add_column('lineage_edges', sa.Column('relationship_type', sqlmodel.sql.sqltypes.AutoString(), nullable=False))
    op.create_index(op.f('ix_lineage_edges_id'), 'lineage_edges', ['id'], unique=False)
    op.drop_column('lineage_edges', 'created_at')
    op.drop_column('lineage_edges', 'edge_type')
    op.create_index(op.f('ix_ml_suggestions_id'), 'ml_suggestions', ['id'], unique=False)
    op.alter_column('notifications', 'message',
               existing_type=sa.TEXT(),
               type_=sqlmodel.sql.sqltypes.AutoString(),
               existing_nullable=False)
    op.alter_column('sensitivity_labels', 'description',
               existing_type=sa.TEXT(),
               type_=sqlmodel.sql.sqltypes.AutoString(),
               existing_nullable=True)
    op.alter_column('sensitivity_labels', 'color',
               existing_type=sa.VARCHAR(),
               nullable=False)
    op.alter_column('sensitivity_labels', 'is_conditional',
               existing_type=sa.BOOLEAN(),
               nullable=False)
    op.alter_column('sensitivity_labels', 'condition_expression',
               existing_type=sa.TEXT(),
               type_=sqlmodel.sql.sqltypes.AutoString(),
               existing_nullable=True)
    op.alter_column('sensitivity_labels', 'applies_to',
               existing_type=sa.VARCHAR(),
               nullable=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('sensitivity_labels', 'applies_to',
               existing_type=sa.VARCHAR(),
               nullable=True)
    op.alter_column('sensitivity_labels', 'condition_expression',
               existing_type=sqlmodel.sql.sqltypes.AutoString(),
               type_=sa.TEXT(),
               existing_nullable=True)
    op.alter_column('sensitivity_labels', 'is_conditional',
               existing_type=sa.BOOLEAN(),
               nullable=True)
    op.alter_column('sensitivity_labels', 'color',
               existing_type=sa.VARCHAR(),
               nullable=True)
    op.alter_column('sensitivity_labels', 'description',
               existing_type=sqlmodel.sql.sqltypes.AutoString(),
               type_=sa.TEXT(),
               existing_nullable=True)
    op.alter_column('notifications', 'message',
               existing_type=sqlmodel.sql.sqltypes.AutoString(),
               type_=sa.TEXT(),
               existing_nullable=False)
    op.drop_index(op.f('ix_ml_suggestions_id'), table_name='ml_suggestions')
    op.add_column('lineage_edges', sa.Column('edge_type', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('lineage_edges', sa.Column('created_at', postgresql.TIMESTAMP(), server_default=sa.text('now()'), autoincrement=False, nullable=False))
    op.drop_index(op.f('ix_lineage_edges_id'), table_name='lineage_edges')
    op.drop_column('lineage_edges', 'relationship_type')
    op.drop_column('lineage_edges', 'target_type')
    op.drop_column('lineage_edges', 'source_type')
    op.alter_column('label_reviews', 'review_note',
               existing_type=sqlmodel.sql.sqltypes.AutoString(),
               type_=sa.TEXT(),
               existing_nullable=True)
    op.alter_column('label_reviews', 'review_status',
               existing_type=sa.Enum('PROPOSED', 'APPROVED', 'REJECTED', 'EXPIRED', name='labelstatus'),
               type_=postgresql.ENUM('proposed', 'approved', 'rejected', 'expired', name='labelstatus_review'),
               nullable=True)
    op.alter_column('label_reviews', 'proposal_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.alter_column('label_proposals', 'status',
               existing_type=postgresql.ENUM('proposed', 'approved', 'rejected', 'expired', name='labelstatus'),
               nullable=True)
    op.alter_column('label_proposals', 'justification',
               existing_type=sqlmodel.sql.sqltypes.AutoString(),
               type_=sa.TEXT(),
               existing_nullable=True)
    op.alter_column('label_proposals', 'label_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.alter_column('label_audits', 'note',
               existing_type=sqlmodel.sql.sqltypes.AutoString(),
               type_=sa.TEXT(),
               existing_nullable=True)
    op.alter_column('label_audits', 'proposal_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.create_table('condition_templates',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('label', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('value', sa.TEXT(), autoincrement=False, nullable=False),
    sa.Column('description', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.Column('updated_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('condition_templates_pkey'))
    )
    op.create_index(op.f('ix_condition_templates_label'), 'condition_templates', ['label'], unique=True)
    op.create_table('permissions',
    sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('permissions_id_seq'::regclass)"), autoincrement=True, nullable=False),
    sa.Column('action', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('resource', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('conditions', sa.TEXT(), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', name='permissions_pkey'),
    postgresql_ignore_search_path=False
    )
    op.create_index(op.f('ix_permissions_resource'), 'permissions', ['resource'], unique=False)
    op.create_index(op.f('ix_permissions_action'), 'permissions', ['action'], unique=False)
    op.create_table('resource_roles',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('role_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('resource_type', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('resource_id', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('assigned_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['role_id'], ['roles.id'], name=op.f('resource_roles_role_id_fkey')),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('resource_roles_user_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('resource_roles_pkey'))
    )
    op.create_table('schemaversion',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('source', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('version_id', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('database_type', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('extracted_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('schemaversion_pkey'))
    )
    op.create_table('roles',
    sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('roles_id_seq'::regclass)"), autoincrement=True, nullable=False),
    sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('description', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', name='roles_pkey'),
    postgresql_ignore_search_path=False
    )
    op.create_index(op.f('ix_roles_name'), 'roles', ['name'], unique=True)
    op.create_table('role_permissions',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('role_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('permission_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['permission_id'], ['permissions.id'], name=op.f('role_permissions_permission_id_fkey1'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['role_id'], ['roles.id'], name=op.f('role_permissions_role_id_fkey1'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('role_permissions_pkey1'))
    )
    op.create_table('resources',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('type', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('parent_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('engine', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('details', sa.TEXT(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['parent_id'], ['resources.id'], name=op.f('resources_parent_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('resources_pkey'))
    )
    op.create_index(op.f('ix_resources_type'), 'resources', ['type'], unique=False)
    op.create_index(op.f('ix_resources_name'), 'resources', ['name'], unique=False)
    op.create_table('email_verification_codes',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('email', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('code', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.Column('expires_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('email_verification_codes_pkey'))
    )
    op.create_index(op.f('ix_email_verification_codes_email'), 'email_verification_codes', ['email'], unique=False)
    op.create_table('groups',
    sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('groups_id_seq'::regclass)"), autoincrement=True, nullable=False),
    sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('description', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', name='groups_pkey'),
    postgresql_ignore_search_path=False
    )
    op.create_index(op.f('ix_groups_name'), 'groups', ['name'], unique=True)
    op.create_table('role_inheritance',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('parent_role_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('child_role_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['child_role_id'], ['roles.id'], name=op.f('role_inheritance_child_role_id_fkey')),
    sa.ForeignKeyConstraint(['parent_role_id'], ['roles.id'], name=op.f('role_inheritance_parent_role_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('role_inheritance_pkey'))
    )
    op.create_table('users',
    sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('users_id_seq'::regclass)"), autoincrement=True, nullable=False),
    sa.Column('email', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('hashed_password', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('is_active', sa.BOOLEAN(), autoincrement=False, nullable=False),
    sa.Column('is_verified', sa.BOOLEAN(), autoincrement=False, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.Column('mfa_enabled', sa.BOOLEAN(), autoincrement=False, nullable=False),
    sa.Column('mfa_secret', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('role', sa.VARCHAR(), server_default=sa.text("'user'::character varying"), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name='users_pkey'),
    postgresql_ignore_search_path=False
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_table('access_requests',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('resource_type', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('resource_id', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('requested_role', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('justification', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('status', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('review_note', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.Column('reviewed_by', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('reviewed_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('access_requests_user_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('access_requests_pkey'))
    )
    op.create_table('datatableschema',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('database_type', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('table_name', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('column_name', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('data_type', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('nullable', sa.BOOLEAN(), autoincrement=False, nullable=False),
    sa.Column('categories', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('datasensitivitylabel', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('datatableschema_pkey'))
    )
    op.create_table('group_roles',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('group_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('role_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('resource_type', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('resource_id', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('assigned_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['group_id'], ['groups.id'], name=op.f('group_roles_group_id_fkey')),
    sa.ForeignKeyConstraint(['role_id'], ['roles.id'], name=op.f('group_roles_role_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('group_roles_pkey'))
    )
    op.create_table('rbac_audit_logs',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('action', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('performed_by', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('target_user', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('resource_type', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('resource_id', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('role', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('status', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('note', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('timestamp', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.Column('entity_type', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('entity_id', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('before_state', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('after_state', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('correlation_id', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('actor_ip', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('actor_device', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('api_client', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('extra_metadata', sa.TEXT(), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', name=op.f('rbac_audit_logs_pkey'))
    )
    op.create_index(op.f('ix_rbac_audit_logs_entity_type'), 'rbac_audit_logs', ['entity_type'], unique=False)
    op.create_index(op.f('ix_rbac_audit_logs_entity_id'), 'rbac_audit_logs', ['entity_id'], unique=False)
    op.create_index(op.f('ix_rbac_audit_logs_correlation_id'), 'rbac_audit_logs', ['correlation_id'], unique=False)
    op.create_table('user_roles',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('role_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['role_id'], ['roles.id'], name=op.f('user_roles_role_id_fkey')),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('user_roles_user_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('user_roles_pkey'))
    )
    op.create_table('user_groups',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('group_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['group_id'], ['groups.id'], name=op.f('user_groups_group_id_fkey')),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('user_groups_user_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('user_groups_pkey'))
    )
    op.create_table('deny_assignments',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('group_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('action', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('resource', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('conditions', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['group_id'], ['groups.id'], name=op.f('deny_assignments_group_id_fkey')),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('deny_assignments_user_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('deny_assignments_pkey'))
    )
    op.create_table('role_permissions_old',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('role_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('permission_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['permission_id'], ['permissions.id'], name=op.f('role_permissions_permission_id_fkey')),
    sa.ForeignKeyConstraint(['role_id'], ['roles.id'], name=op.f('role_permissions_role_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('role_permissions_pkey'))
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
