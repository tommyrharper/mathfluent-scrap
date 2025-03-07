from logging import Logger
from openai import OpenAI
from anthropic import Anthropic


class LLM:
    def __init__(
        self, logger: Logger, openai_client: OpenAI, anthropic_client: Anthropic
    ):
        self.logger = logger
        self.openai_client = openai_client
        self.anthropic_client = anthropic_client

    async def query_openai_vision_one_shot(self, question: str, image: str) -> str:
        """
        Query OpenAI's vision model to check a handwritten math answer.
        Returns "1" for correct answers and "0" for incorrect answers.
        """
        self.logger.info("Querying OpenAI vision model with one-shot prompt")
        text = f"For the math question '{question}', analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0. Return no other characters."
        return await self.query_openai_vision(text, image, 10)

    async def query_claude_vision_one_shot(self, question: str, image: str) -> str:
        """
        Query Claude 3.7 Sonnet to check a handwritten math answer.
        Returns "1" for correct answers and "0" for incorrect answers.
        """
        self.logger.info("Querying Claude vision model with one-shot prompt")
        system = 'Instruction to Claude: Your response must be only 0 or 1, with no additional text. Below are examples to illustrate the expected output:\n\nExample 1:\n\nInput:\nPrompt: "For the math question 2 + 2, analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0."\nImage: (Handwritten response: "4")\nExpected Output:\n1\nExample 2:\n\nInput:\nPrompt: "For the math question 5 × 3, analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0."\nImage: (Handwritten response: "20")\nExpected Output:\n0\nExample 3:\n\nInput:\nPrompt: "For the math question √16, analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0."\nImage: (Handwritten response: "5")\nExpected Output:\n0\nExample 4:\n\nInput:\nPrompt: "For the math question 10 ÷ 2, analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0."\nImage: (Handwritten response: "5")\nExpected Output:\n1\nFinal Clarification:\nClaude, your response must be either 0 or 1 with no extra text. Do not explain, do not add words, do not format the response in any way—just return 0 or 1.'
        text = f"For the math question '{question}', analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0. Return no other characters."
        return await self.query_claude_vision(text, image, system, 10)

    async def query_openai_vision(
        self, text: str, image: str | None = None, max_tokens: int = 10
    ) -> str:
        """
        Query OpenAI's vision model. Can handle both vision and text-only queries.
        Returns "1" for correct answers and "0" for incorrect answers.
        """
        try:
            content = [{"type": "text", "text": text}]
            if image:
                content.insert(
                    0,
                    {
                        "type": "image_url",
                        "image_url": {"url": image, "detail": "high"},
                    },
                )

            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": content}],
                max_tokens=max_tokens,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            self.logger.error(f"Error in OpenAI vision query: {str(e)}")
            raise

    async def query_claude_vision(
        self,
        text: str,
        image: str | None = None,
        system: str = 'Be very concise',
        max_tokens: int = 10,
    ) -> str:
        """
        Query Claude 3.7 Sonnet. Can handle both vision and text-only queries.
        Returns "1" for correct answers and "0" for incorrect answers.
        """
        try:
            content = [{"type": "text", "text": text}]
            if image:
                # Convert data URL to base64 if needed
                base64_data = (
                    image.split("base64,")[1]
                    if image.startswith("data:image")
                    else image
                )
                content.insert(
                    0,
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": base64_data,
                        },
                    },
                )

            response = self.anthropic_client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=max_tokens,
                system=system,
                messages=[{"role": "user", "content": content}],
            )
            return response.content[0].text.strip()
        except Exception as e:
            self.logger.error(f"Error in Claude vision query: {str(e)}")
            raise

    async def query_claude_for_analysis_gpt_for_decision(self, question: str, image: str) -> str:
        """
        Two-step process:
        1. Get Claude to analyze the answer
        2. Have GPT-4 convert that analysis into a binary decision
        """
        self.logger.info("Starting two-step analysis with Claude and GPT-4")
        analysis = await self.query_claude_analysis(question, image)
        self.logger.info(f"Claude analysis: {analysis}")
        return await self.query_openai_for_decision(analysis)

    async def query_claude_analysis(self, question: str, image: str) -> str:
        """
        Query Claude to analyze whether the handwritten answer is correct.
        Returns a natural language analysis.
        """
        self.logger.info("Querying Claude for detailed analysis")
        text = f"For the math question '{question}', tell me whether the answer in the image is correct or incorrect. Be very concise and to the point. Use the minimum amount of words possible."
        return await self.query_claude_vision(text, image, max_tokens=1000)

    async def query_openai_for_decision(self, analysis: str) -> str:
        """
        Query GPT-4 to convert Claude's analysis into a binary decision.
        Returns "1" for correct answers and "0" for incorrect answers.
        """
        self.logger.info("Querying GPT-4 to convert analysis to decision")
        text = f"My teacher has marked my math question. He has marked it as follows: {analysis}. I need you to distill his response into a single number. If he has marked my answer as correct, return 1, otherwise return 0. Return no other characters."
        return await self.query_openai_vision(text)
