import os
from emergentintegrations.llm.chat import LlmChat, UserMessage
from typing import Dict, Optional
import asyncio
from database import save_hint, get_quest_by_id

class AIHintGenerator:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            print("Warning: GEMINI_API_KEY not set, AI hints will be disabled")
            self.enabled = False
        else:
            self.enabled = True
    
    async def generate_hint(self, quest_id: str, user_code: str, user_progress: Dict) -> str:
        """Generate an AI-powered hint for the user"""
        try:
            # Get quest information
            quest = await get_quest_by_id(quest_id)
            if not quest:
                return "Sorry, I couldn't find information about this quest."
            
            # Create a new chat instance for this hint request
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"hint_{quest_id}_{user_progress.get('user_id', 'guest')}",
                system_message=self._get_system_message()
            )
            
            # Configure to use Gemini
            chat.with_model("gemini", "gemini-2.0-flash")
            
            # Create the hint request
            hint_request = self._create_hint_request(quest, user_code, user_progress)
            
            # Generate hint
            user_message = UserMessage(text=hint_request)
            response = await chat.send_message(user_message)
            
            # Save the hint to database
            await save_hint(
                user_id=user_progress.get('user_id', 'guest'),
                quest_id=quest_id,
                hint_text=response,
                context=user_code
            )
            
            return response
            
        except Exception as e:
            print(f"Error generating hint: {e}")
            return "Sorry, I couldn't generate a hint right now. Please try again later."
    
    def _get_system_message(self) -> str:
        """Get the system message for the AI assistant"""
        return """You are a helpful Python programming tutor for CodeQuest, a gamified learning platform. 
        Your role is to provide educational hints and guidance to help users learn Python programming concepts.

        Guidelines:
        - Always be encouraging and supportive
        - Provide hints that guide users toward the solution rather than giving direct answers
        - Focus on helping users understand concepts, not just complete tasks
        - Use beginner-friendly language and explanations
        - If users are stuck, provide step-by-step guidance
        - Encourage best practices and clean code
        - Make learning fun and engaging with fantasy/adventure themes when appropriate
        - Keep responses concise but helpful (2-3 sentences max)

        Remember: You're helping adventurers on their coding quest! Make it educational and fun."""
    
    def _create_hint_request(self, quest: Dict, user_code: str, user_progress: Dict) -> str:
        """Create a hint request based on quest and user context"""
        
        request = f"""
**Quest Information:**
- Title: {quest['title']}
- Description: {quest['description']}
- Difficulty: {quest['difficulty']}
- Category: {quest['category']}

**Instructions:**
{chr(10).join(f"- {instruction}" for instruction in quest['instructions'])}

**User's Current Code:**
```python
{user_code}
```

**User Progress:**
- Level: {user_progress.get('level', 1)}
- XP: {user_progress.get('xp', 0)}
- Completed Quests: {len(user_progress.get('completed_quests', []))}

**Request:**
Please provide a helpful hint to guide this user toward completing the quest. Focus on what they might be missing or what they should try next. Don't give the complete solution, but help them understand the concept and take the next step.
"""
        
        return request
    
    async def generate_explanation(self, quest_id: str, concept: str) -> str:
        """Generate an explanation for a specific Python concept"""
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"explanation_{quest_id}_{concept}",
                system_message=self._get_explanation_system_message()
            )
            
            chat.with_model("gemini", "gemini-2.0-flash")
            
            explanation_request = f"""
            Please explain the Python concept: {concept}
            
            Make it beginner-friendly and include:
            1. What it is
            2. Why it's useful
            3. A simple example
            4. Common use cases
            
            Keep it engaging with a fantasy/adventure theme where appropriate.
            """
            
            user_message = UserMessage(text=explanation_request)
            response = await chat.send_message(user_message)
            
            return response
            
        except Exception as e:
            print(f"Error generating explanation: {e}")
            return "Sorry, I couldn't generate an explanation right now. Please try again later."
    
    def _get_explanation_system_message(self) -> str:
        """Get system message for concept explanations"""
        return """You are a Python programming tutor for CodeQuest. Your role is to explain Python concepts in a clear, beginner-friendly way with engaging fantasy/adventure themes.

        Guidelines:
        - Use simple, clear language
        - Provide practical examples
        - Make it fun and engaging
        - Use analogies and metaphors when helpful
        - Focus on practical understanding
        - Keep explanations concise but comprehensive
        - Encourage further learning"""

# Initialize the AI hint generator
ai_hint_generator = AIHintGenerator()