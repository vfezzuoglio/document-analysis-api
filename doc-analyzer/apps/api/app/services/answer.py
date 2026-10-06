from anthropic import Anthropic

from app.core.config import settings

SYSTEM_PROMPT = (
    "You answer questions about a document using ONLY the numbered excerpts provided. "
    "Cite the excerpts you use inline, like [1] or [2][3]. "
    "If the excerpts don't contain the answer, say you couldn't find it in the document. "
    "Never use outside knowledge. Be concise."
)

_client: Anthropic | None = None


def get_client() -> Anthropic:
    global _client
    if _client is None:
        _client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


def generate_answer(question: str, chunks: list[str]) -> str:
    context = "\n\n".join(f"[{i}] {text}" for i, text in enumerate(chunks, start=1))

    response = get_client().messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=600,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Excerpts:\n\n{context}\n\nQuestion: {question}",
            }
        ],
    )

    return "".join(b.text for b in response.content if b.type == "text").strip()