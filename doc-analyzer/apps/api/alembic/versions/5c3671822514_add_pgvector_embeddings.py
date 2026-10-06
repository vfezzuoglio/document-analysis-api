"""add pgvector embeddings

Revision ID: 5c3671822514
Revises: 30fd81f35d02
Create Date: 2026-10-06 15:46:15.830263

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


# revision identifiers, used by Alembic.
revision: str = '5c3671822514'
down_revision: Union[str, Sequence[str], None] = '30fd81f35d02'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add pgvector extension, embedding column, and HNSW index."""
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.add_column("chunks", sa.Column("embedding", Vector(384), nullable=True))
    op.execute(
        "CREATE INDEX chunks_embedding_idx ON chunks "
        "USING hnsw (embedding vector_cosine_ops)"
    )


def downgrade() -> None:
    """Remove embedding index and column."""
    op.execute("DROP INDEX IF EXISTS chunks_embedding_idx")
    op.drop_column("chunks", "embedding")