"""
GPT-4o Design Analysis Engine
Extracts design intelligence and psychological understanding from advertisements
"""

import openai
import json
import base64
import logging
import time
from typing import Dict, Any, Optional
from pathlib import Path

from models.schemas import AdStructure, AnalysisResponse

# Configure logging
logger = logging.getLogger(__name__)


class GPTDesignAnalyzer:
    """
    Advanced design analysis using GPT-4o's reasoning capabilities
    Focuses on design psychology and strategic understanding
    """
    
    def __init__(self, api_key: str):
        """Initialize with OpenAI API key"""
        self.client = openai.OpenAI(api_key=api_key)
        
        # Analysis prompts optimized for GPT-4o
        self.design_analysis_prompt = """
You are an expert creative director analyzing this advertisement. Provide a comprehensive analysis focusing on:

1. DESIGN PSYCHOLOGY:
   - What emotions does this design evoke and how?
   - What brand positioning signals are being sent?
   - How does the visual hierarchy guide the viewer's attention?

2. TECHNICAL STRUCTURE:
   - Exact positions, dimensions, and styling of all elements
   - Typography choices and their psychological impact
   - Color palette and its emotional associations
   - Spacing relationships that create the overall feeling

3. EFFECTIVENESS FACTORS:
   - What makes this ad compelling?
   - How do elements work together to create impact?
   - What would happen if you changed key elements?

Output this as structured JSON with two sections:
- "design_strategy": The psychological and strategic analysis
- "technical_specs": Precise reconstruction data

Be extremely detailed in measurements and styling.  This will be used to recreate the ad exactly. you must also account for the possibility of this ad being taken on a phone camera (ex. of an ad on a subway), perhaps with unrelated background reflections. 
"""

        self.extraction_prompt = """
Now extract the precise technical specifications needed to recreate this ad:

{
  "canvas": {
    "width": 1080,
    "height": 1080,
    "background": {
      "type": "solid_color",
      "value": "#FFFFFF",
      "gradient_direction": null,
      "gradient_colors": null
    }
  },
  "elements": [
    {
      "id": "unique_identifier",
      "type": "text",
      "content": "actual text content",
      "position": {
        "x": 100,
        "y": 100,
        "width": 880,
        "height": 200,
        "rotation": 0
      },
      "styling": {
        "font_family": "Arial, Helvetica, sans-serif",
        "font_size": 48,
        "font_weight": "bold",
        "line_height": 1.2,
        "letter_spacing": 0,
        "text_align": "left",
        "color": "#000000",
        "background_color": "transparent",
        "border_radius": 8,
        "padding": {"top": 10, "right": 15, "bottom": 10, "left": 15},
        "shadow": {"x": 2, "y": 2, "blur": 4, "color": "#00000020"},
        "opacity": 1.0
      },
      "z_index": 1,
      "design_purpose": "Why this element exists and its role in the overall strategy"
    }
  ],
  "design_strategy": {
    "primary_emotion": "urgency",
    "visual_flow": "How the eye moves through the design",
    "key_success_factors": ["What makes this ad work"],
    "brand_signals": "What this design communicates about the brand",
    "adaptation_notes": "Key things to preserve when adapting to new brand"
  }
}

Be precise with measurements. Include every visible element. Use actual element types: text, image, button, logo, background_element.
"""

    def analyze_ad(self, image_path: str) -> AnalysisResponse:
        """
        Extract design intelligence from any advertisement
        
        Args:
            image_path: Path to the uploaded ad image
            
        Returns:
            AnalysisResponse with analysis and structured data
        """
        start_time = time.time()
        
        try:
            logger.info(f"Starting analysis of image: {image_path}")
            
            # Validate image exists
            if not Path(image_path).exists():
                return AnalysisResponse(
                    success=False,
                    error="Image file not found"
                )
            
            # Convert image to base64
            image_data = self._encode_image(image_path)
            if not image_data:
                return AnalysisResponse(
                    success=False,
                    error="Failed to encode image"
                )
            
            # Primary design analysis
            logger.info("Performing primary design analysis...")
            analysis_text = self._perform_design_analysis(image_data)
            
            if not analysis_text:
                return AnalysisResponse(
                    success=False,
                    error="Failed to get design analysis from GPT-4o"
                )
            
            # Extract structured JSON data
            logger.info("Extracting structured specifications...")
            structured_data = self._extract_structured_data(image_data)
            
            if not structured_data:
                return AnalysisResponse(
                    success=False,
                    error="Failed to extract structured data",
                    analysis=analysis_text
                )
            
            # Validate and parse structure
            try:
                ad_structure = AdStructure(**structured_data)
                logger.info("Successfully parsed ad structure")
                
                processing_time = time.time() - start_time
                
                return AnalysisResponse(
                    success=True,
                    analysis=analysis_text,
                    structure=ad_structure,
                    processing_time=processing_time
                )
                
            except Exception as validation_error:
                logger.error(f"Structure validation failed: {validation_error}")
                return AnalysisResponse(
                    success=False,
                    error=f"Structure validation failed: {str(validation_error)}",
                    analysis=analysis_text
                )
                
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            return AnalysisResponse(
                success=False,
                error=f"Analysis failed: {str(e)}"
            )

    def _encode_image(self, image_path: str) -> Optional[str]:
        """Convert image to base64 for API"""
        try:
            with open(image_path, 'rb') as image_file:
                image_data = base64.b64encode(image_file.read()).decode('utf-8')
                logger.debug(f"Encoded image: {len(image_data)} characters")
                return image_data
        except Exception as e:
            logger.error(f"Image encoding failed: {e}")
            return None

    def _perform_design_analysis(self, image_data: str) -> Optional[str]:
        """Perform primary design analysis with GPT-4o"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",  # Use GPT-4o for vision analysis
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": self.design_analysis_prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}
                            }
                        ]
                    }
                ],
                max_tokens=4000,
                temperature=0.3  # Lower temperature for more consistent analysis
            )
            
            analysis = response.choices[0].message.content
            logger.debug(f"Design analysis completed: {len(analysis)} characters")
            return analysis
            
        except Exception as e:
            logger.error(f"Design analysis failed: {e}")
            return None

    def _extract_structured_data(self, image_data: str) -> Optional[Dict[str, Any]]:
        """Extract structured JSON specifications"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": self.extraction_prompt},
                            {
                                "type": "image_url", 
                                "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}
                            }
                        ]
                    }
                ],
                max_tokens=3000,
                temperature=0.1  # Very low temperature for consistent structure
            )
            
            raw_response = response.choices[0].message.content
            logger.info(f"Raw extraction response length: {len(raw_response) if raw_response else 0} characters")
            
            # Check if response is empty
            if not raw_response or not raw_response.strip():
                logger.error("GPT-4o returned empty response for structured data extraction")
                return None
            
            # Log first 200 chars for debugging
            logger.debug(f"Raw response start: {raw_response[:200]}...")
            
            # Parse JSON from response
            structured_data = self._parse_json_from_response(raw_response)
            
            if structured_data:
                logger.info("Successfully extracted structured data")
                return structured_data
            else:
                logger.error("Failed to parse JSON from GPT-4o response")
                # Try a simpler approach - look for any JSON-like content
                return self._fallback_json_extraction(raw_response)
            
        except Exception as e:
            logger.error(f"Structured extraction failed: {e}")
            return None

    def _parse_json_from_response(self, response_content: str) -> Optional[Dict[str, Any]]:
        """Extract and parse JSON from GPT response"""
        try:
            # Try to find JSON block in response
            lines = response_content.split('\n')
            json_start = None
            
            # Look for opening brace
            for i, line in enumerate(lines):
                stripped = line.strip()
                if stripped.startswith('{'):
                    json_start = i
                    break
            
            if json_start is not None:
                # Extract JSON content
                json_content = '\n'.join(lines[json_start:])
                
                # Find matching closing brace
                brace_count = 0
                json_end = None
                
                for i, char in enumerate(json_content):
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            json_end = i + 1
                            break
                
                if json_end:
                    json_str = json_content[:json_end]
                    
                    # Clean up common JSON formatting issues
                    json_str = self._clean_json_string(json_str)
                    
                    # Parse JSON
                    parsed_json = json.loads(json_str)
                    logger.debug("Successfully parsed JSON structure")
                    return parsed_json
            
            # If no JSON block found, try parsing entire response
            cleaned_response = self._clean_json_string(response_content)
            return json.loads(cleaned_response)
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed: {e}")
            logger.debug(f"Problematic JSON: {response_content[:500]}...")
            return None
        except Exception as e:
            logger.error(f"JSON extraction failed: {e}")
            return None

    def _clean_json_string(self, json_str: str) -> str:
        """Clean up common JSON formatting issues from GPT responses"""
        # Remove any markdown code block markers
        json_str = json_str.replace('```json', '').replace('```', '')
        
        # Remove any leading/trailing whitespace
        json_str = json_str.strip()
        
        # Fix common JSON issues
        json_str = json_str.replace('\\n', '\n')  # Fix escaped newlines
        json_str = json_str.replace('\\"', '"')   # Fix escaped quotes
        
        return json_str

    def _fallback_json_extraction(self, response_content: str) -> Optional[Dict[str, Any]]:
        """Fallback method for extracting JSON when primary parsing fails"""
        try:
            logger.info("Attempting fallback JSON extraction")
            
            # Try to find any { ... } blocks in the response
            import re
            
            # Look for JSON-like patterns
            json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
            matches = re.findall(json_pattern, response_content, re.DOTALL)
            
            for match in matches:
                try:
                    # Try to parse each potential JSON block
                    cleaned_match = self._clean_json_string(match)
                    parsed = json.loads(cleaned_match)
                    
                    # Basic validation - check if it has expected structure
                    if isinstance(parsed, dict) and any(key in parsed for key in ['canvas', 'elements', 'design_strategy']):
                        logger.info("Fallback extraction successful")
                        return parsed
                        
                except json.JSONDecodeError:
                    continue
            
            # If no valid JSON found, create a minimal structure
            logger.warning("No valid JSON found, creating minimal structure")
            return self._create_minimal_structure()
            
        except Exception as e:
            logger.error(f"Fallback extraction failed: {e}")
            return self._create_minimal_structure()

    def _create_minimal_structure(self) -> Dict[str, Any]:
        """Create a minimal valid structure when extraction fails"""
        return {
            "canvas": {
                "width": 1080,
                "height": 1080,
                "background": {
                    "type": "solid_color",
                    "value": "#FFFFFF"
                }
            },
            "elements": [
                {
                    "id": "placeholder_text",
                    "type": "text",
                    "content": "Generated Ad",
                    "position": {
                        "x": 100,
                        "y": 100,
                        "width": 880,
                        "height": 100,
                        "rotation": 0
                    },
                    "styling": {
                        "font_family": "Arial, Helvetica, sans-serif",
                        "font_size": 48,
                        "font_weight": "bold",
                        "color": "#000000"
                    },
                    "z_index": 1,
                    "design_purpose": "Main text element"
                }
            ],
            "design_strategy": {
                "primary_emotion": "attention",
                "visual_flow": "top to bottom",
                "key_success_factors": ["clear typography", "strong contrast"],
                "brand_signals": "professional and clean",
                "adaptation_notes": "Maintain simplicity and readability"
            }
        }

    def validate_structure(self, structure_dict: Dict[str, Any]) -> bool:
        """Validate that extracted structure has required fields"""
        try:
            required_fields = ['canvas', 'elements', 'design_strategy']
            
            # Check top-level fields
            for field in required_fields:
                if field not in structure_dict:
                    logger.error(f"Missing required field: {field}")
                    return False
            
            # Validate canvas
            canvas = structure_dict['canvas']
            if 'width' not in canvas or 'height' not in canvas:
                logger.error("Canvas missing width or height")
                return False
            
            # Validate elements
            elements = structure_dict['elements']
            if not isinstance(elements, list):
                logger.error("Elements must be a list")
                return False
            
            # Validate each element has required fields
            for i, element in enumerate(elements):
                required_element_fields = ['id', 'type', 'content', 'position']
                for field in required_element_fields:
                    if field not in element:
                        logger.error(f"Element {i} missing required field: {field}")
                        return False
            
            logger.info("Structure validation passed")
            return True
            
        except Exception as e:
            logger.error(f"Structure validation error: {e}")
            return False
            