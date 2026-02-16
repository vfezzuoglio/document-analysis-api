def chunk_text(text: str, max_chars: int = 1200, overlap: int = 150) -> list[str]:
    text = " ".join(text.split())
    if not text:
        return []

    chunks = []
    i = 0
    n = len(text)

    while i < n:
        end = min(i + max_chars, n)
        chunks.append(text[i:end])
        if end == n:
            break
        i = max(0, end - overlap)

    return chunks
