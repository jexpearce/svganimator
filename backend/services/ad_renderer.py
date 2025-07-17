"""
Ad Rendering Engine
Converts JSON ad structures into high-quality images using PIL
Handles text rendering, image compositing, and complex layouts
"""

import logging
import os
import math
from typing import Dict, List, Optional, Tuple, Union
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np

from models.schemas import AdStructure, AdElement, Canvas, Background, Position, ElementStyling

# Configure logging
logger = logging.getLogger(__name__)


class AdRenderer:
    """
    High-quality ad rendering with advanced typography and compositing
    Supports complex layouts, effects, and brand asset integration
    """
    
    def __init__(self, assets_dir: str = "./assets", fonts_dir: str = "./fonts"):
        """
        Initialize renderer
        
        Args:
            assets_dir: Directory containing brand assets
            fonts_dir: Directory containing font files
        """
        self.assets_dir = Path(assets_dir)
        self.fonts_dir = Path(fonts_dir)
        self.font_cache = {}
        
        # Default fonts fallback
        self.default_fonts = {
            "sans-serif": ["Arial", "Helvetica", "DejaVu Sans", "Liberation Sans"],
            "serif": ["Times New Roman", "Times", "DejaVu Serif", "Liberation Serif"],
            "monospace": ["Courier New", "Courier", "DejaVu Sans Mono", "Liberation Mono"]
        }
        
        # Create directories if they don't exist
        self.assets_dir.mkdir(parents=True, exist_ok=True)
        self.fonts_dir.mkdir(parents=True, exist_ok=True)
    
    def render_ad(self, structure: AdStructure, brand_assets: Dict[str, Dict[str, str]], 
                  output_path: str) -> bool:
        """
        Render complete ad from JSON structure
        
        Args:
            structure: AdStructure object with all ad elements
            brand_assets: Dictionary of asset variants (logo, product, etc.)
            output_path: Path to save the rendered image
            
        Returns:
            True if rendering successful, False otherwise
        """
        try:
            logger.info(f"Starting ad rendering to: {output_path}")
            
            # Create canvas
            canvas = self._create_canvas(structure.canvas)
            
            # Render background
            self._render_background(canvas, structure.canvas.background)
            
            # Sort elements by z_index for proper layering
            sorted_elements = sorted(structure.elements, key=lambda x: x.z_index)
            
            # Render each element
            for element in sorted_elements:
                logger.debug(f"Rendering element: {element.id} ({element.type})")
                self._render_element(canvas, element, brand_assets)
            
            # Apply final optimizations
            optimized_canvas = self._optimize_final_image(canvas)
            
            # Save the result
            optimized_canvas.save(output_path, "PNG", quality=95, optimize=True)
            
            logger.info(f"Successfully rendered ad: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Ad rendering failed: {e}")
            return False
    
    def _create_canvas(self, canvas_info: Canvas) -> Image.Image:
        """Create base canvas with specified dimensions"""
        return Image.new('RGBA', (canvas_info.width, canvas_info.height), (255, 255, 255, 0))
    
    def _render_background(self, canvas: Image.Image, background: Background) -> None:
        """Render canvas background"""
        try:
            if background.type == "solid_color":
                self._render_solid_background(canvas, background.value)
            elif background.type == "gradient":
                self._render_gradient_background(canvas, background)
            elif background.type == "image":
                self._render_image_background(canvas, background.value)
            
        except Exception as e:
            logger.warning(f"Background rendering failed: {e}, using white background")
            self._render_solid_background(canvas, "#FFFFFF")
    
    def _render_solid_background(self, canvas: Image.Image, color: str) -> None:
        """Render solid color background"""
        rgb_color = self._hex_to_rgb(color)
        bg_layer = Image.new('RGB', canvas.size, rgb_color)
        canvas.paste(bg_layer, (0, 0))
    
    def _render_gradient_background(self, canvas: Image.Image, background: Background) -> None:
        """Render gradient background"""
        if not background.gradient_colors or len(background.gradient_colors) < 2:
            self._render_solid_background(canvas, background.value)
            return
        
        width, height = canvas.size
        direction = background.gradient_direction or "vertical"
        
        # Create gradient
        gradient = self._create_gradient(
            canvas.size, 
            background.gradient_colors, 
            direction
        )
        
        canvas.paste(gradient, (0, 0))
    
    def _render_image_background(self, canvas: Image.Image, image_url: str) -> None:
        """Render image background"""
        try:
            # Load background image (assuming it's a local path for now)
            bg_image = Image.open(image_url).convert("RGB")
            
            # Resize to fit canvas
            bg_resized = bg_image.resize(canvas.size, Image.LANCZOS)
            
            canvas.paste(bg_resized, (0, 0))
            
        except Exception as e:
            logger.warning(f"Background image loading failed: {e}")
            self._render_solid_background(canvas, "#FFFFFF")
    
    def _render_element(self, canvas: Image.Image, element: AdElement, 
                       brand_assets: Dict[str, Dict[str, str]]) -> None:
        """Render individual element based on type"""
        try:
            if element.type == "text":
                self._render_text_element(canvas, element)
            elif element.type == "button":
                self._render_button_element(canvas, element)
            elif element.type == "logo":
                self._render_logo_element(canvas, element, brand_assets.get("logo", {}))
            elif element.type == "image":
                self._render_image_element(canvas, element, brand_assets.get("product", {}))
            elif element.type == "background_element":
                self._render_background_element(canvas, element)
            
        except Exception as e:
            logger.error(f"Element rendering failed for {element.id}: {e}")
    
    def _render_text_element(self, canvas: Image.Image, element: AdElement) -> None:
        """Render text with advanced typography"""
        draw = ImageDraw.Draw(canvas)
        pos = element.position
        style = element.styling or ElementStyling()
        
        # Get font
        font = self._get_font(
            style.font_family or "Arial",
            style.font_size or 24,
            style.font_weight or "normal"
        )
        
        # Handle text wrapping and positioning
        text_lines = self._wrap_text(element.content, font, pos.width)
        
        # Calculate text positioning
        line_height = (style.font_size or 24) * (style.line_height or 1.2)
        total_text_height = len(text_lines) * line_height
        
        # Vertical alignment
        if style.text_align == "center":
            start_y = pos.y + (pos.height - total_text_height) / 2
        else:
            start_y = pos.y
        
        # Render each line
        for i, line in enumerate(text_lines):
            line_y = start_y + (i * line_height)
            
            # Horizontal alignment
            text_width = font.getlength(line)
            
            if style.text_align == "center":
                line_x = pos.x + (pos.width - text_width) / 2
            elif style.text_align == "right":
                line_x = pos.x + pos.width - text_width
            else:
                line_x = pos.x
            
            # Apply text shadow if specified
            if style.shadow:
                shadow_x = line_x + style.shadow.x
                shadow_y = line_y + style.shadow.y
                shadow_color = style.shadow.color
                
                draw.text(
                    (shadow_x, shadow_y),
                    line,
                    font=font,
                    fill=shadow_color
                )
            
            # Render main text
            text_color = style.color or "#000000"
            draw.text(
                (line_x, line_y),
                line,
                font=font,
                fill=text_color
            )
    
    def _render_button_element(self, canvas: Image.Image, element: AdElement) -> None:
        """Render button with background and text"""
        draw = ImageDraw.Draw(canvas)
        pos = element.position
        style = element.styling or ElementStyling()
        
        # Draw button background
        bg_color = style.background_color or "#000000"
        border_radius = style.border_radius or 0
        
        if border_radius > 0:
            self._draw_rounded_rectangle(
                draw, 
                [pos.x, pos.y, pos.x + pos.width, pos.y + pos.height],
                border_radius,
                fill=bg_color
            )
        else:
            draw.rectangle(
                [pos.x, pos.y, pos.x + pos.width, pos.y + pos.height],
                fill=bg_color
            )
        
        # Apply button shadow if specified
        if style.shadow:
            # Create shadow layer (simplified implementation)
            pass
        
        # Render button text (centered)
        font = self._get_font(
            style.font_family or "Arial",
            style.font_size or 18,
            style.font_weight or "normal"
        )
        
        text_color = style.color or "#FFFFFF"
        text_width = font.getlength(element.content)
        text_height = style.font_size or 18
        
        text_x = pos.x + (pos.width - text_width) / 2
        text_y = pos.y + (pos.height - text_height) / 2
        
        draw.text(
            (text_x, text_y),
            element.content,
            font=font,
            fill=text_color
        )
    
    def _render_logo_element(self, canvas: Image.Image, element: AdElement, 
                           logo_assets: Dict[str, str]) -> None:
        """Render logo choosing appropriate variant"""
        try:
            # Choose best logo variant based on context
            logo_path = self._choose_logo_variant(logo_assets, element.styling)
            
            if not logo_path or not Path(logo_path).exists():
                logger.warning(f"Logo asset not found: {logo_path}")
                return
            
            # Load and process logo
            logo_img = Image.open(logo_path).convert("RGBA")
            
            # Resize to fit position
            logo_resized = self._resize_maintain_aspect(
                logo_img, 
                (element.position.width, element.position.height)
            )
            
            # Apply positioning
            x_offset = (element.position.width - logo_resized.width) // 2
            y_offset = (element.position.height - logo_resized.height) // 2
            
            paste_x = element.position.x + x_offset
            paste_y = element.position.y + y_offset
            
            # Apply opacity if specified
            if element.styling and element.styling.opacity and element.styling.opacity < 1.0:
                logo_resized = self._apply_opacity(logo_resized, element.styling.opacity)
            
            # Paste with alpha compositing
            canvas.paste(logo_resized, (paste_x, paste_y), logo_resized)
            
        except Exception as e:
            logger.error(f"Logo rendering failed: {e}")
    
    def _render_image_element(self, canvas: Image.Image, element: AdElement,
                            product_assets: Dict[str, str]) -> None:
        """Render product or other images"""
        try:
            # Choose appropriate product variant
            image_path = self._choose_product_variant(product_assets, element.styling)
            
            if not image_path or not Path(image_path).exists():
                logger.warning(f"Product asset not found: {image_path}")
                return
            
            # Load and process image
            product_img = Image.open(image_path).convert("RGBA")
            
            # Resize maintaining aspect ratio
            product_resized = self._resize_maintain_aspect(
                product_img,
                (element.position.width, element.position.height)
            )
            
            # Center within position
            x_offset = (element.position.width - product_resized.width) // 2
            y_offset = (element.position.height - product_resized.height) // 2
            
            paste_x = element.position.x + x_offset
            paste_y = element.position.y + y_offset
            
            # Apply opacity if specified
            if element.styling and element.styling.opacity and element.styling.opacity < 1.0:
                product_resized = self._apply_opacity(product_resized, element.styling.opacity)
            
            canvas.paste(product_resized, (paste_x, paste_y), product_resized)
            
        except Exception as e:
            logger.error(f"Image rendering failed: {e}")
    
    def _render_background_element(self, canvas: Image.Image, element: AdElement) -> None:
        """Render decorative background elements"""
        draw = ImageDraw.Draw(canvas)
        pos = element.position
        style = element.styling or ElementStyling()
        
        # Simple shape rendering based on content
        shape_type = element.content.lower()
        fill_color = style.background_color or style.color or "#000000"
        
        if shape_type in ["circle", "oval"]:
            draw.ellipse(
                [pos.x, pos.y, pos.x + pos.width, pos.y + pos.height],
                fill=fill_color
            )
        elif shape_type in ["rectangle", "rect"]:
            border_radius = style.border_radius or 0
            if border_radius > 0:
                self._draw_rounded_rectangle(
                    draw,
                    [pos.x, pos.y, pos.x + pos.width, pos.y + pos.height],
                    border_radius,
                    fill=fill_color
                )
            else:
                draw.rectangle(
                    [pos.x, pos.y, pos.x + pos.width, pos.y + pos.height],
                    fill=fill_color
                )
    
    def _get_font(self, family: str, size: int, weight: str) -> ImageFont.FreeTypeFont:
        """Load font with caching and fallbacks"""
        font_key = f"{family}_{size}_{weight}"
        
        if font_key in self.font_cache:
            return self.font_cache[font_key]
        
        # Try to load requested font
        font_paths = self._get_font_paths(family, weight)
        
        for font_path in font_paths:
            try:
                font = ImageFont.truetype(font_path, size)
                self.font_cache[font_key] = font
                return font
            except OSError:
                continue
        
        # Fallback to default font
        try:
            default_font = ImageFont.load_default()
            self.font_cache[font_key] = default_font
            return default_font
        except:
            # Last resort: create a basic font
            self.font_cache[font_key] = ImageFont.load_default()
            return self.font_cache[font_key]
    
    def _get_font_paths(self, family: str, weight: str) -> List[str]:
        """Get potential font file paths"""
        paths = []
        
        # Clean family name
        family_clean = family.replace(",", "").split()[0].lower()
        
        # Weight variations
        weight_suffixes = {
            "bold": ["-Bold", "-bold", "Bold", "b"],
            "light": ["-Light", "-light", "Light", "l"],
            "normal": ["", "-Regular", "-regular", "Regular"]
        }
        
        suffixes = weight_suffixes.get(weight.lower(), [""])
        
        # Common font locations and extensions
        font_dirs = [
            self.fonts_dir,
            Path("/System/Library/Fonts"),  # macOS
            Path("/usr/share/fonts"),       # Linux
            Path("C:/Windows/Fonts"),       # Windows
        ]
        
        extensions = [".ttf", ".otf", ".TTF", ".OTF"]
        
        for font_dir in font_dirs:
            if not font_dir.exists():
                continue
                
            for suffix in suffixes:
                for ext in extensions:
                    # Try exact match
                    font_file = font_dir / f"{family_clean}{suffix}{ext}"
                    if font_file.exists():
                        paths.append(str(font_file))
                    
                    # Try capitalized
                    font_file = font_dir / f"{family_clean.capitalize()}{suffix}{ext}"
                    if font_file.exists():
                        paths.append(str(font_file))
        
        return paths
    
    def _wrap_text(self, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> List[str]:
        """Wrap text to fit within specified width"""
        words = text.split()
        lines = []
        current_line = []
        
        for word in words:
            test_line = ' '.join(current_line + [word])
            
            # Check if line fits
            if font.getlength(test_line) <= max_width:
                current_line.append(word)
            else:
                # Start new line
                if current_line:
                    lines.append(' '.join(current_line))
                    current_line = [word]
                else:
                    # Single word too long, add anyway
                    lines.append(word)
        
        # Add remaining words
        if current_line:
            lines.append(' '.join(current_line))
        
        return lines
    
    def _choose_logo_variant(self, logo_assets: Dict[str, str], 
                           styling: Optional[ElementStyling]) -> Optional[str]:
        """Choose appropriate logo variant based on context"""
        if not logo_assets:
            return None
        
        # Default to transparent for best compatibility
        if "transparent" in logo_assets:
            return logo_assets["transparent"]
        elif "original" in logo_assets:
            return logo_assets["original"]
        else:
            return list(logo_assets.values())[0]
    
    def _choose_product_variant(self, product_assets: Dict[str, str],
                              styling: Optional[ElementStyling]) -> Optional[str]:
        """Choose appropriate product variant"""
        if not product_assets:
            return None
        
        # Prefer enhanced or transparent variants
        if "enhanced" in product_assets:
            return product_assets["enhanced"]
        elif "transparent" in product_assets:
            return product_assets["transparent"]
        elif "original" in product_assets:
            return product_assets["original"]
        else:
            return list(product_assets.values())[0]
    
    def _resize_maintain_aspect(self, image: Image.Image, max_size: Tuple[int, int]) -> Image.Image:
        """Resize image maintaining aspect ratio"""
        img_ratio = image.width / image.height
        max_ratio = max_size[0] / max_size[1]
        
        if img_ratio > max_ratio:
            # Image is wider
            new_width = max_size[0]
            new_height = int(max_size[0] / img_ratio)
        else:
            # Image is taller
            new_height = max_size[1]
            new_width = int(max_size[1] * img_ratio)
        
        return image.resize((new_width, new_height), Image.LANCZOS)
    
    def _apply_opacity(self, image: Image.Image, opacity: float) -> Image.Image:
        """Apply opacity to image"""
        if image.mode != "RGBA":
            image = image.convert("RGBA")
        
        # Create alpha channel multiplier
        alpha = image.split()[-1]
        alpha = alpha.point(lambda p: int(p * opacity))
        
        # Apply new alpha
        image.putalpha(alpha)
        return image
    
    def _create_gradient(self, size: Tuple[int, int], colors: List[str], 
                        direction: str) -> Image.Image:
        """Create gradient image"""
        width, height = size
        gradient = Image.new('RGB', size)
        draw = ImageDraw.Draw(gradient)
        
        # Convert colors to RGB
        rgb_colors = [self._hex_to_rgb(color) for color in colors]
        
        if direction == "horizontal":
            for x in range(width):
                # Calculate color interpolation
                ratio = x / width
                color = self._interpolate_colors(rgb_colors, ratio)
                draw.line([(x, 0), (x, height)], fill=color)
        else:  # vertical or default
            for y in range(height):
                ratio = y / height
                color = self._interpolate_colors(rgb_colors, ratio)
                draw.line([(0, y), (width, y)], fill=color)
        
        return gradient
    
    def _interpolate_colors(self, colors: List[Tuple[int, int, int]], ratio: float) -> Tuple[int, int, int]:
        """Interpolate between multiple colors"""
        if len(colors) < 2:
            return colors[0] if colors else (0, 0, 0)
        
        # Clamp ratio
        ratio = max(0, min(1, ratio))
        
        # Calculate segment
        segment_size = 1.0 / (len(colors) - 1)
        segment = int(ratio / segment_size)
        
        if segment >= len(colors) - 1:
            return colors[-1]
        
        # Local ratio within segment
        local_ratio = (ratio - segment * segment_size) / segment_size
        
        # Interpolate between two colors
        color1 = colors[segment]
        color2 = colors[segment + 1]
        
        r = int(color1[0] + (color2[0] - color1[0]) * local_ratio)
        g = int(color1[1] + (color2[1] - color1[1]) * local_ratio)
        b = int(color1[2] + (color2[2] - color1[2]) * local_ratio)
        
        return (r, g, b)
    
    def _draw_rounded_rectangle(self, draw: ImageDraw.Draw, coords: List[int], 
                              radius: int, fill: str) -> None:
        """Draw rounded rectangle"""
        x1, y1, x2, y2 = coords
        
        # Draw main rectangle
        draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=fill)
        draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=fill)
        
        # Draw corners
        draw.pieslice([x1, y1, x1 + 2*radius, y1 + 2*radius], 180, 270, fill=fill)
        draw.pieslice([x2 - 2*radius, y1, x2, y1 + 2*radius], 270, 360, fill=fill)
        draw.pieslice([x1, y2 - 2*radius, x1 + 2*radius, y2], 90, 180, fill=fill)
        draw.pieslice([x2 - 2*radius, y2 - 2*radius, x2, y2], 0, 90, fill=fill)
    
    def _optimize_final_image(self, canvas: Image.Image) -> Image.Image:
        """Apply final optimizations to the rendered image"""
        try:
            # Convert to RGB for final output (removes alpha channel)
            if canvas.mode == "RGBA":
                # Create white background
                background = Image.new("RGB", canvas.size, (255, 255, 255))
                background.paste(canvas, mask=canvas.split()[-1])  # Use alpha as mask
                canvas = background
            
            # Slight sharpening for crisp text
            enhancer = ImageEnhance.Sharpness(canvas)
            canvas = enhancer.enhance(1.1)
            
            return canvas
            
        except Exception as e:
            logger.warning(f"Image optimization failed: {e}")
            return canvas
    
    def _hex_to_rgb(self, hex_color: str) -> Tuple[int, int, int]:
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        if len(hex_color) == 3:
            hex_color = ''.join([c*2 for c in hex_color])
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        