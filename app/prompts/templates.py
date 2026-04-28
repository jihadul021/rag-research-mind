def get_prompt(mode: str, query: str, context: str) -> str:
    """Return a mode-specific prompt combining query and retrieved context."""

    base = f"Use the following research paper excerpts to answer:\n\n{context}\n\n"

    if mode == "summary":
        return base + "Summarize this research paper in clear bullet points covering: objective, methodology, key findings, and limitations."

    elif mode == "simple":
        return base + f"Explain this to a beginner with no technical background. Use simple language and analogies. Keep it concise.\n\nQuestion: {query}"

    elif mode == "technical":
        return base + f"Answer this question technically and concisely. Only go into methodology, contributions and limitations if the question specifically asks for them.\n\nQuestion: {query}"

    elif mode == "compare":
        return base + f"Compare and contrast the approaches, methodologies, and findings from these paper excerpts.\n\nQuestion: {query}"

    else:
        return base + f"Answer this question briefly and directly based on the paper.\n\nQuestion: {query}"