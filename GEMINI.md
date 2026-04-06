# Gemini AI Configuration

## API Key
The user has provided a specific API key for Gemini AI:
`AIzaSyBQ0KlmgJu5eDnNUTBfGLhQGPzaPfjD61o`

## Model Preferences
- **Primary Model**: `gemini-3-flash-preview` for general chat and fast actions.
- **Advanced Tasks**: `gemini-3.1-pro-preview` for complex reasoning or data analysis.

## Interaction Guidelines
- **System Instruction**: Always use the expanded system prompt in `AssistantView.tsx` to ensure the bot is aware of all project features.
- **Function Calling**: Use function declarations for all system actions (navigation, creation, opening, etc.).
- **Confirmation**: Always ask for user confirmation before performing any write operations (create, update, delete).
- **Multilingual**: Support Hindi and English as primary languages for the user's business context.
