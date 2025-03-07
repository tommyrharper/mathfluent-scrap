from logging import Logger
from openai import OpenAI
from anthropic import Anthropic


class LLM:
    def __init__(self, logger: Logger, openai_client: OpenAI, anthropic_client: Anthropic):
        self.logger = logger
        self.openai_client = openai_client
        self.anthropic_client = anthropic_client

    async def query_openai_vision(self, image: str, question: str) -> str:
        """
        Query OpenAI's vision model to check a handwritten math answer.
        Returns "1" for correct answers and "0" for incorrect answers.
        """
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {"url": image, "detail": "high"},
                            },
                            {
                                "type": "text",
                                "text": f"For the math question '{question}', analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0. Return no other characters.",
                            },
                        ],
                    }
                ],
                max_tokens=10,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            self.logger.error(f"Error in OpenAI vision query: {str(e)}")
            raise


    async def query_claude_vision(self, image: str, question: str) -> str:
        """
        Query Claude 3.7 Sonnet to check a handwritten math answer.
        Returns "1" for correct answers and "0" for incorrect answers.
        """
        try:
            # Convert data URL to base64 if needed
            if image.startswith("data:image"):
                base64_data = image.split("base64,")[1]
            else:
                base64_data = image

            response = self.anthropic_client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=10,
                system='Instruction to Claude: Your response must be only 0 or 1, with no additional text. Below are examples to illustrate the expected output:\n\nExample 1:\n\nInput:\nPrompt: "For the math question 2 + 2, analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0."\nImage: (Handwritten response: "4")\nExpected Output:\n1\nExample 2:\n\nInput:\nPrompt: "For the math question 5 × 3, analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0."\nImage: (Handwritten response: "20")\nExpected Output:\n0\nExample 3:\n\nInput:\nPrompt: "For the math question √16, analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0."\nImage: (Handwritten response: "5")\nExpected Output:\n0\nExample 4:\n\nInput:\nPrompt: "For the math question 10 ÷ 2, analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0."\nImage: (Handwritten response: "5")\nExpected Output:\n1\nFinal Clarification:\nClaude, your response must be either 0 or 1 with no extra text. Do not explain, do not add words, do not format the response in any way—just return 0 or 1.',
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/png",
                                    "data": base64_data,
                                },
                            },
                            {
                                "type": "text",
                                "text": f"For the math question '{question}', analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0. Return no other characters.",
                            },
                        ],
                    }
                ],
            )
            return response.content[0].text.strip()
        except Exception as e:
            self.logger.error(f"Error in Claude vision query: {str(e)}")
            raise