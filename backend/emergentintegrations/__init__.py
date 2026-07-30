"""Minimal local stub for optional emergentintegrations package.

This allows the backend to import modules that reference emergentintegrations
without having the real package installed. AI features will raise at runtime
if actually invoked.
"""

class _MissingPackageError(Exception):
    pass


class LlmChat:
    def __init__(self, *args, **kwargs):
        raise _MissingPackageError(
            "emergentintegrations is not installed. "
            "Install it to use AI/LLM features, or remove the feature flag."
        )


class UserMessage:
    def __init__(self, *args, **kwargs):
        raise _MissingPackageError(
            "emergentintegrations is not installed. "
            "Install it to use AI/LLM features, or remove the feature flag."
        )


class OpenAISpeechToText:
    def __init__(self, *args, **kwargs):
        raise _MissingPackageError(
            "emergentintegrations is not installed. "
            "Install it to use speech-to-text features, or remove the feature flag."
        )
