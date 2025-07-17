"""
GPT-4o Ad Generation Engine
Generates new branded ads using design intelligence and brand assets
Preserves psychological impact while adapting to new brand identity
"""

import openai
import json
import logging
import time
from typing import Dict, Any, Optional, List

from models.schemas import AdStructure, GenerationResponse

# Configure logging
logger = logging.getLogger(__name__)


class GPTAdGenerator:
    """
    Advanced ad generation using GPT-4o's design intelligence
    Adapts original design strategy to new brand while preserving effectiveness
    """
    
    def __init__(self, api_key: str):
        """Initialize with OpenAI API key"""
        self.client = openai.OpenAI(api_key=api_key)
        
        # Generation prompt optimized for design adaptation
        self.generation_prompt_template = """
You are an expert creative director recreating an ad design with new brand assets.

ORIGINAL DESIGN STRUCTURE:
{original_structure}

BRAND ASSETS AVAILABLE:
- Logo variants: {logo_variants}
- Product images: {product_variants}
- Brand colors: {brand_colors}

USER INPUTS:
- Text replacements: {text_replacements}
- Primary brand color: {primary_color}
- Company name: {company_name}

TASK:
1. Adapt the original design strategy to the new brand
2. Replace text elements with user's content while maintaining hierarchy
3. Choose appropriate brand colors that maintain the design's emotional impact
4. Select the best logo and product variants for each context
5. Preserve the psychological impact and visual flow of the original
6. Ensure text fits properly in allocated spaces
7. Maintain or improve the overall aesthetic appeal

OUTPUT REQUIREMENTS:
Return a complete JSON structure for the new ad with these sections:
1. "adapted_structure" - The complete modified ad structure
2. "design_notes" - Explanation of your design choices and adaptations
3. "recommendations" - Suggestions for further optimization

CRITICAL GUIDELINES:
- Preserve what makes the original design effective
- Ensure the new brand feels authentic and premium
- Maintain visual hierarchy and emotional flow
- Consider color psychology and brand positioning
- Ensure all text is legible and well-positioned
- Keep the same overall layout proportions unless adaptation requires changes

Be precise with all measurements, colors, and styling choices.
"""

        self.refinement_prompt = """
Review and refine this generated ad structure for optimal brand representation:

GENERATED STRUCTURE:
{generated_structure}

ORIGINAL DESIGN STRATEGY:
{design_strategy}

BRAND CONTEXT:
- Company: {company_name}
- Industry implications from brand colors: {brand_colors}
- Key brand assets: {brand_assets}

REFINEMENT TASKS:
1. Ensure color choices align with brand psychology
2. Verify text hierarchy maintains impact
3. Check that element positioning creates optimal visual flow
4. Validate that the adaptation feels authentic to the new brand
5. Confirm all measurements and styling are precise

Return the refined structure with detailed notes on improvements made.
"""

    def generate_branded_ad(self, original_structure: AdStructure, brand_assets: Dict[str, Any], 
                          user_inputs: Dict[str, Any]) -> GenerationResponse:
        """
        Generate new ad using GPT-4o's design intelligence
        
        Args:
            original_structure: Analyzed structure from original ad
            brand_assets: Available brand asset variants
            user_inputs: User customizations and preferences
            
        Returns:
            GenerationResponse with new ad structure and design notes
        """
        start_time = time.time()
        
        try:
            logger.info("Starting branded ad generation...")
            
            # Prepare generation prompt
            generation_prompt = self._prepare_generation_prompt(
                original_structure, brand_assets, user_inputs
            )
            
            # Generate initial adaptation
            logger.info("Generating initial ad adaptation...")
            initial_response = self._generate_initial_adaptation(generation_prompt)
            
            if not initial_response:
                return GenerationResponse(
                    success=False,
                    error="Failed to generate initial adaptation"
                )
            
            # Parse the response
            parsed_response = self._parse_generation_response(initial_response)
            
            if not parsed_response["success"]:
                return GenerationResponse(
                    success=False,
                    error=f"Failed to parse generation response: {parsed_response.get('error')}",
                    design_notes=initial_response
                )
            
            # Refine the generated structure
            logger.info("Refining generated structure...")
            refined_structure = self._refine_generated_structure(
                parsed_response["structure"], 
                original_structure.design_strategy, 
                brand_assets, 
                user_inputs
            )
            
            # Validate final structure
            try:
                final_ad_structure = AdStructure(**refined_structure)
                processing_time = time.time() - start_time
                
                logger.info(f"Successfully generated branded ad in {processing_time:.2f}s")
                
                return GenerationResponse(
                    success=True,
                    structure=final_ad_structure,
                    design_notes=parsed_response.get("design_notes", ""),
                    processing_time=processing_time
                )
                
            except Exception as validation_error:
                logger.error(f"Final structure validation failed: {validation_error}")
                return GenerationResponse(
                    success=False,
                    error=f"Structure validation failed: {str(validation_error)}",
                    design_notes=parsed_response.get("design_notes", "")
                )
                
        except Exception as e:
            logger.error(f"Ad generation failed: {str(e)}")
            return GenerationResponse(
                success=False,
                error=f"Generation failed: {str(e)}"
            )

    def _prepare_generation_prompt(self, original_structure: AdStructure, 
                                 brand_assets: Dict[str, Any], 
                                 user_inputs: Dict[str, Any]) -> str:
        """Prepare the generation prompt with all context"""
        
        # Convert structure to JSON for prompt
        original_json = original_structure.model_dump()
        
        # Extract available variants
        logo_variants = list(brand_assets.get("logo_variants", {}).keys())
        product_variants = list(brand_assets.get("product_variants", {}).keys())
        brand_colors = brand_assets.get("brand_colors", ["#000000"])
        
        # Format user inputs
        text_replacements = user_inputs.get("text_replacements", {})
        primary_color = user_inputs.get("primary_color", "#000000")
        company_name = user_inputs.get("company_name", "")
        
        return self.generation_prompt_template.format(
            original_structure=json.dumps(original_json, indent=2),
            logo_variants=logo_variants,
            product_variants=product_variants,
            brand_colors=brand_colors,
            text_replacements=json.dumps(text_replacements, indent=2),
            primary_color=primary_color,
            company_name=company_name
        )

    def _generate_initial_adaptation(self, prompt: str) -> Optional[str]:
        """Generate initial ad adaptation"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert creative director with deep understanding of design psychology, brand strategy, and visual communication. Your task is to adapt ad designs while preserving their psychological effectiveness."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=4000,
                temperature=0.3  # Balance creativity with consistency
            )
            
            response_content = response.choices[0].message.content
            logger.debug(f"Generated initial adaptation: {len(response_content)} characters")
            return response_content
            
        except Exception as e:
            logger.error(f"Initial generation failed: {e}")
            return None

    def _parse_generation_response(self, response_content: str) -> Dict[str, Any]:
        """Parse the generation response to extract structure and notes"""
        try:
            # Look for JSON structure in response
            adapted_structure = self._extract_json_from_response(response_content, "adapted_structure")
            design_notes = self._extract_text_section(response_content, "design_notes")
            recommendations = self._extract_text_section(response_content, "recommendations")
            
            if adapted_structure:
                return {
                    "success": True,
                    "structure": adapted_structure,
                    "design_notes": design_notes or "",
                    "recommendations": recommendations or ""
                }
            else:
                # Try to parse entire response as JSON
                cleaned_response = self._clean_response_text(response_content)
                parsed_json = json.loads(cleaned_response)
                
                return {
                    "success": True,
                    "structure": parsed_json.get("adapted_structure", parsed_json),
                    "design_notes": parsed_json.get("design_notes", ""),
                    "recommendations": parsed_json.get("recommendations", "")
                }
                
        except Exception as e:
            logger.error(f"Response parsing failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "raw_response": response_content
            }

    def _refine_generated_structure(self, generated_structure: Dict[str, Any], 
                                  design_strategy: Any, brand_assets: Dict[str, Any],
                                  user_inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Refine the generated structure for optimal results"""
        try:
            # Apply refinement prompt
            refinement_prompt = self.refinement_prompt.format(
                generated_structure=json.dumps(generated_structure, indent=2),
                design_strategy=design_strategy.model_dump() if hasattr(design_strategy, 'model_dump') else str(design_strategy),
                company_name=user_inputs.get("company_name", ""),
                brand_colors=brand_assets.get("brand_colors", []),
                brand_assets=list(brand_assets.keys())
            )
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a senior creative director focused on precision and brand authenticity. Review and improve ad structures for maximum impact."
                    },
                    {
                        "role": "user",
                        "content": refinement_prompt
                    }
                ],
                max_tokens=3000,
                temperature=0.2  # Lower temperature for refinement
            )
            
            refined_response = response.choices[0].message.content
            
            # Try to extract refined structure
            refined_structure = self._extract_json_from_response(refined_response, "refined_structure")
            
            if refined_structure:
                logger.info("Successfully refined generated structure")
                return refined_structure
            else:
                # If refinement fails, return original with smart defaults
                logger.warning("Refinement failed, applying smart defaults")
                return self._apply_smart_defaults(generated_structure, user_inputs)
                
        except Exception as e:
            logger.warning(f"Refinement failed: {e}, applying defaults")
            return self._apply_smart_defaults(generated_structure, user_inputs)

    def _apply_smart_defaults(self, structure: Dict[str, Any], user_inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Apply smart defaults if refinement fails"""
        try:
            # Ensure text replacements are applied
            text_replacements = user_inputs.get("text_replacements", {})
            
            if "elements" in structure:
                for element in structure["elements"]:
                    element_id = element.get("id", "")
                    if element_id in text_replacements:
                        element["content"] = text_replacements[element_id]
            
            # Ensure primary color is used appropriately
            primary_color = user_inputs.get("primary_color", "#000000")
            
            # Apply primary color to key elements
            if "elements" in structure:
                for element in structure["elements"]:
                    if element.get("type") == "button":
                        if "styling" not in element:
                            element["styling"] = {}
                        element["styling"]["background_color"] = primary_color
                    elif element.get("type") == "text" and "primary" in element.get("id", "").lower():
                        if "styling" not in element:
                            element["styling"] = {}
                        element["styling"]["color"] = primary_color
            
            return structure
            
        except Exception as e:
            logger.error(f"Smart defaults failed: {e}")
            return structure

    def _extract_json_from_response(self, response: str, section_name: str = None) -> Optional[Dict[str, Any]]:
        """Extract JSON structure from response text"""
        try:
            lines = response.split('\n')
            
            # Look for JSON block markers or section headers
            json_start = None
            json_content = ""
            
            if section_name:
                # Look for specific section
                in_section = False
                for line in lines:
                    if section_name.lower() in line.lower() and (":" in line or "{" in line):
                        in_section = True
                        continue
                    elif in_section and line.strip().startswith('{'):
                        json_start = True
                        json_content = line + '\n'
                        break
            
            if not json_start:
                # Look for any JSON block
                for i, line in enumerate(lines):
                    stripped = line.strip()
                    if stripped.startswith('{'):
                        json_content = '\n'.join(lines[i:])
                        break
            
            if json_content:
                # Extract complete JSON object
                brace_count = 0
                json_str = ""
                
                for char in json_content:
                    json_str += char
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            break
                
                # Clean and parse JSON
                cleaned_json = self._clean_json_string(json_str)
                return json.loads(cleaned_json)
            
            return None
            
        except Exception as e:
            logger.debug(f"JSON extraction failed: {e}")
            return None

    def _extract_text_section(self, response: str, section_name: str) -> Optional[str]:
        """Extract text content from a named section"""
        try:
            lines = response.split('\n')
            in_section = False
            section_content = []
            
            for line in lines:
                if section_name.lower() in line.lower() and ":" in line:
                    in_section = True
                    # Include content after colon if present
                    colon_index = line.find(':')
                    if colon_index >= 0 and len(line) > colon_index + 1:
                        section_content.append(line[colon_index + 1:].strip())
                    continue
                elif in_section:
                    # Stop at next section or JSON block
                    if line.strip().startswith('{') or any(keyword in line.lower() for keyword in ['adapted_structure', 'recommendations', 'design_notes']):
                        break
                    section_content.append(line)
            
            return '\n'.join(section_content).strip() if section_content else None
            
        except Exception as e:
            logger.debug(f"Text section extraction failed: {e}")
            return None

    def _clean_json_string(self, json_str: str) -> str:
        """Clean JSON string for parsing"""
        # Remove markdown code blocks
        json_str = json_str.replace('```json', '').replace('```', '')
        
        # Remove common prefixes
        json_str = json_str.strip()
        
        # Fix common issues
        json_str = json_str.replace('\\n', '\n')
        json_str = json_str.replace('\\"', '"')
        
        return json_str

    def _clean_response_text(self, text: str) -> str:
        """Clean response text for JSON parsing"""
        # Remove everything before first {
        start_idx = text.find('{')
        if start_idx >= 0:
            text = text[start_idx:]
        
        # Remove everything after last }
        end_idx = text.rfind('}')
        if end_idx >= 0:
            text = text[:end_idx + 1]
        
        return self._clean_json_string(text)
        