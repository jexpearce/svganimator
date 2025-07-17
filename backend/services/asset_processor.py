"""
Brand Asset Processing Engine
Handles logo processing, product images, and color extraction
Creates multiple variants optimized for different contexts
"""

import logging
import tempfile
import os
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import io

from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
import numpy as np
from rembg import remove
from colorthief import ColorThief

from models.schemas import ProcessedBrandAssets

# Configure logging
logger = logging.getLogger(__name__)


class BrandAssetProcessor:
    """
    Advanced brand asset processing with intelligent variant generation
    Optimizes assets for different design contexts and backgrounds
    """
    
    def __init__(self, max_size: int = 2048):
        """
        Initialize processor
        
        Args:
            max_size: Maximum dimension for processed images
        """
        self.max_size = max_size
        
    def process_logo(self, logo_path: str, output_dir: str) -> Dict[str, str]:
        """
        Create multiple logo variants for different contexts
        
        Args:
            logo_path: Path to original logo file
            output_dir: Directory to save variants
            
        Returns:
            Dictionary mapping variant names to file paths
        """
        try:
            logger.info(f"Processing logo: {logo_path}")
            
            # Load and validate original image
            original = Image.open(logo_path).convert("RGBA")
            original = self._resize_image(original, self.max_size)
            
            # Create output directory
            Path(output_dir).mkdir(parents=True, exist_ok=True)
            
            variants = {}
            
            # Save original
            original_path = os.path.join(output_dir, "original.png")
            original.save(original_path, "PNG")
            variants["original"] = original_path
            
            # Create transparent background version
            transparent = self._ensure_transparency(original)
            transparent_path = os.path.join(output_dir, "transparent.png")
            transparent.save(transparent_path, "PNG")
            variants["transparent"] = transparent_path
            
            # Create monochrome versions
            white_version = self._create_monochrome_version(transparent, "white")
            white_path = os.path.join(output_dir, "white.png")
            white_version.save(white_path, "PNG")
            variants["white"] = white_path
            
            black_version = self._create_monochrome_version(transparent, "black")
            black_path = os.path.join(output_dir, "black.png")
            black_version.save(black_path, "PNG")
            variants["black"] = black_path
            
            # Create high contrast version
            high_contrast = self._enhance_contrast(transparent)
            contrast_path = os.path.join(output_dir, "high_contrast.png")
            high_contrast.save(contrast_path, "PNG")
            variants["high_contrast"] = contrast_path
            
            logger.info(f"Created {len(variants)} logo variants")
            return variants
            
        except Exception as e:
            logger.error(f"Logo processing failed: {e}")
            return {}
    
    def process_product_image(self, product_path: str, output_dir: str) -> Dict[str, str]:
        """
        Prepare product image with background removal and effects
        
        Args:
            product_path: Path to original product image
            output_dir: Directory to save variants
            
        Returns:
            Dictionary mapping variant names to file paths
        """
        try:
            logger.info(f"Processing product image: {product_path}")
            
            # Load and validate original image
            original = Image.open(product_path).convert("RGBA")
            original = self._resize_image(original, self.max_size)
            
            # Create output directory
            Path(output_dir).mkdir(parents=True, exist_ok=True)
            
            variants = {}
            
            # Save original
            original_path = os.path.join(output_dir, "original.png")
            original.save(original_path, "PNG")
            variants["original"] = original_path
            
            # Remove background
            logger.info("Removing background...")
            no_bg = self._remove_background(original)
            transparent_path = os.path.join(output_dir, "transparent.png")
            no_bg.save(transparent_path, "PNG")
            variants["transparent"] = transparent_path
            
            # Add drop shadow
            with_shadow = self._add_drop_shadow(no_bg)
            shadow_path = os.path.join(output_dir, "with_shadow.png")
            with_shadow.save(shadow_path, "PNG")
            variants["with_shadow"] = shadow_path
            
            # Enhanced version
            enhanced = self._enhance_product_image(no_bg)
            enhanced_path = os.path.join(output_dir, "enhanced.png")
            enhanced.save(enhanced_path, "PNG")
            variants["enhanced"] = enhanced_path
            
            logger.info(f"Created {len(variants)} product variants")
            return variants
            
        except Exception as e:
            logger.error(f"Product processing failed: {e}")
            return {}
    
    def extract_brand_colors(self, logo_image_path: str, num_colors: int = 5) -> List[str]:
        """
        Extract dominant colors from logo for brand palette
        
        Args:
            logo_image_path: Path to logo image
            num_colors: Number of colors to extract
            
        Returns:
            List of hex color codes
        """
        try:
            logger.info(f"Extracting brand colors from: {logo_image_path}")
            
            # Use ColorThief for color extraction
            color_thief = ColorThief(logo_image_path)
            
            # Get dominant color
            dominant_color = color_thief.get_color(quality=1)
            
            # Get color palette
            palette = color_thief.get_palette(color_count=num_colors, quality=1)
            
            # Convert RGB tuples to hex
            colors = [self._rgb_to_hex(color) for color in palette]
            
            # Ensure dominant color is first
            dominant_hex = self._rgb_to_hex(dominant_color)
            if dominant_hex not in colors:
                colors.insert(0, dominant_hex)
            else:
                # Move dominant color to front
                colors.remove(dominant_hex)
                colors.insert(0, dominant_hex)
            
            # Remove duplicates while preserving order
            unique_colors = []
            for color in colors:
                if color not in unique_colors:
                    unique_colors.append(color)
            
            logger.info(f"Extracted {len(unique_colors)} brand colors: {unique_colors}")
            return unique_colors[:num_colors]
            
        except Exception as e:
            logger.error(f"Color extraction failed: {e}")
            return ["#000000", "#FFFFFF"]  # Fallback colors
    
    def _resize_image(self, image: Image.Image, max_size: int) -> Image.Image:
        """Resize image maintaining aspect ratio"""
        width, height = image.size
        
        if width <= max_size and height <= max_size:
            return image
        
        # Calculate new dimensions
        if width > height:
            new_width = max_size
            new_height = int((height * max_size) / width)
        else:
            new_height = max_size
            new_width = int((width * max_size) / height)
        
        return image.resize((new_width, new_height), Image.LANCZOS)
    
    def _ensure_transparency(self, image: Image.Image) -> Image.Image:
        """Ensure image has proper transparency using background removal"""
        try:
            if image.mode != "RGBA":
                image = image.convert("RGBA")
            
            # Use rembg for intelligent background removal
            logger.debug("Applying background removal...")
            
            # Convert PIL image to bytes
            img_bytes = io.BytesIO()
            image.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            
            # Remove background
            output_bytes = remove(img_bytes.getvalue())
            
            # Convert back to PIL Image
            result = Image.open(io.BytesIO(output_bytes))
            return result.convert("RGBA")
            
        except Exception as e:
            logger.warning(f"Background removal failed, returning original: {e}")
            return image.convert("RGBA")
    
    def _remove_background(self, image: Image.Image) -> Image.Image:
        """Remove background from product image"""
        return self._ensure_transparency(image)
    
    def _create_monochrome_version(self, image: Image.Image, color: str) -> Image.Image:
        """Create single-color version of logo"""
        try:
            # Convert to grayscale for alpha channel
            gray = image.convert("L")
            
            # Create new colored image
            colored = Image.new("RGBA", image.size, (0, 0, 0, 0))
            
            # Set color values
            if color == "white":
                color_rgb = (255, 255, 255)
            elif color == "black":
                color_rgb = (0, 0, 0)
            else:
                # Parse hex color if provided
                color_rgb = self._hex_to_rgb(color) if color.startswith('#') else (0, 0, 0)
            
            # Apply color with original alpha
            pixels = colored.load()
            gray_pixels = gray.load()
            original_pixels = image.load()
            
            for x in range(image.width):
                for y in range(image.height):
                    # Get original alpha
                    if image.mode == "RGBA":
                        alpha = original_pixels[x, y][3]
                    else:
                        alpha = 255 if gray_pixels[x, y] > 0 else 0
                    
                    # Apply colored pixel with original alpha
                    if alpha > 0:
                        pixels[x, y] = (*color_rgb, alpha)
            
            return colored
            
        except Exception as e:
            logger.error(f"Monochrome conversion failed: {e}")
            return image
    
    def _enhance_contrast(self, image: Image.Image) -> Image.Image:
        """Enhance image contrast"""
        try:
            enhancer = ImageEnhance.Contrast(image)
            enhanced = enhancer.enhance(1.5)  # 50% more contrast
            
            # Also enhance sharpness slightly
            sharpness_enhancer = ImageEnhance.Sharpness(enhanced)
            return sharpness_enhancer.enhance(1.2)
            
        except Exception as e:
            logger.error(f"Contrast enhancement failed: {e}")
            return image
    
    def _add_drop_shadow(self, image: Image.Image, offset: Tuple[int, int] = (8, 8), 
                        blur: int = 15, shadow_color: str = "#00000040") -> Image.Image:
        """Add subtle drop shadow to image"""
        try:
            # Parse shadow color
            shadow_rgb = self._hex_to_rgba(shadow_color)
            
            # Create larger canvas for shadow
            shadow_offset_x, shadow_offset_y = offset
            new_width = image.width + abs(shadow_offset_x) + blur * 2
            new_height = image.height + abs(shadow_offset_y) + blur * 2
            
            # Create shadow canvas
            shadow_canvas = Image.new("RGBA", (new_width, new_height), (0, 0, 0, 0))
            
            # Create shadow mask
            shadow_mask = Image.new("RGBA", (new_width, new_height), (0, 0, 0, 0))
            
            # Position for original image (accounting for blur space)
            paste_x = blur
            paste_y = blur
            
            # Position for shadow (offset from original)
            shadow_x = paste_x + shadow_offset_x
            shadow_y = paste_y + shadow_offset_y
            
            # Create shadow by pasting a colored version of the image
            shadow_img = Image.new("RGBA", image.size, shadow_rgb)
            shadow_alpha = image.split()[-1]  # Get alpha channel
            
            # Paste shadow
            shadow_canvas.paste(shadow_img, (shadow_x, shadow_y), shadow_alpha)
            
            # Blur the shadow
            shadow_canvas = shadow_canvas.filter(ImageFilter.GaussianBlur(radius=blur))
            
            # Paste original image on top
            shadow_canvas.paste(image, (paste_x, paste_y), image)
            
            return shadow_canvas
            
        except Exception as e:
            logger.error(f"Drop shadow failed: {e}")
            return image
    
    def _enhance_product_image(self, image: Image.Image) -> Image.Image:
        """Enhance product image with subtle improvements"""
        try:
            # Enhance brightness slightly
            brightness_enhancer = ImageEnhance.Brightness(image)
            enhanced = brightness_enhancer.enhance(1.1)
            
            # Enhance contrast
            contrast_enhancer = ImageEnhance.Contrast(enhanced)
            enhanced = contrast_enhancer.enhance(1.2)
            
            # Enhance color saturation
            color_enhancer = ImageEnhance.Color(enhanced)
            enhanced = color_enhancer.enhance(1.15)
            
            # Slight sharpening
            sharpness_enhancer = ImageEnhance.Sharpness(enhanced)
            enhanced = sharpness_enhancer.enhance(1.1)
            
            return enhanced
            
        except Exception as e:
            logger.error(f"Product enhancement failed: {e}")
            return image
    
    def _rgb_to_hex(self, rgb: Tuple[int, int, int]) -> str:
        """Convert RGB tuple to hex color"""
        return f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"
    
    def _hex_to_rgb(self, hex_color: str) -> Tuple[int, int, int]:
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    def _hex_to_rgba(self, hex_color: str) -> Tuple[int, int, int, int]:
        """Convert hex color (with optional alpha) to RGBA tuple"""
        hex_color = hex_color.lstrip('#')
        
        if len(hex_color) == 6:
            # RGB only
            r, g, b = self._hex_to_rgb('#' + hex_color)
            return (r, g, b, 255)
        elif len(hex_color) == 8:
            # RGBA
            return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4, 6))
        else:
            return (0, 0, 0, 64)  # Default semi-transparent black
    
    def validate_image(self, image_path: str, max_size_mb: int = 10) -> bool:
        """Validate uploaded image file"""
        try:
            # Check file exists
            if not Path(image_path).exists():
                logger.error("Image file does not exist")
                return False
            
            # Check file size
            file_size_mb = Path(image_path).stat().st_size / (1024 * 1024)
            if file_size_mb > max_size_mb:
                logger.error(f"Image too large: {file_size_mb:.1f}MB > {max_size_mb}MB")
                return False
            
            # Try to open and validate image
            with Image.open(image_path) as img:
                # Check dimensions
                width, height = img.size
                if width < 50 or height < 50:
                    logger.error(f"Image too small: {width}x{height}")
                    return False
                
                if width > 4096 or height > 4096:
                    logger.error(f"Image too large: {width}x{height}")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Image validation failed: {e}")
            return False
            