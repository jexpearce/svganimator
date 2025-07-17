"""
Pydantic models for AdMimic API
Defines all data structures used throughout the application
"""

from typing import Dict, List, Optional, Union, Any
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


class ElementType(str, Enum):
    """Valid element types in ad structure"""
    TEXT = "text"
    IMAGE = "image"
    BUTTON = "button"
    LOGO = "logo"
    BACKGROUND_ELEMENT = "background_element"


class BackgroundType(str, Enum):
    """Valid background types"""
    SOLID_COLOR = "solid_color"
    GRADIENT = "gradient"
    IMAGE = "image"


class GradientDirection(str, Enum):
    """Valid gradient directions"""
    VERTICAL = "vertical"
    HORIZONTAL = "horizontal"
    DIAGONAL = "diagonal"
    RADIAL = "radial"


class TextAlign(str, Enum):
    """Text alignment options"""
    LEFT = "left"
    CENTER = "center"
    RIGHT = "right"
    JUSTIFY = "justify"


class FontWeight(str, Enum):
    """Font weight options"""
    NORMAL = "normal"
    BOLD = "bold"
    LIGHT = "light"
    EXTRA_BOLD = "extra_bold"


# Core Data Structures

class Position(BaseModel):
    """Element position and dimensions"""
    x: int = Field(..., ge=0, description="X coordinate")
    y: int = Field(..., ge=0, description="Y coordinate")
    width: int = Field(..., gt=0, description="Element width")
    height: int = Field(..., gt=0, description="Element height")
    rotation: float = Field(default=0, description="Rotation in degrees")


class Padding(BaseModel):
    """Element padding"""
    top: int = Field(default=0, ge=0)
    right: int = Field(default=0, ge=0)
    bottom: int = Field(default=0, ge=0)
    left: int = Field(default=0, ge=0)


class Shadow(BaseModel):
    """Element shadow properties"""
    x: int = Field(default=0, description="Shadow X offset")
    y: int = Field(default=0, description="Shadow Y offset")
    blur: int = Field(default=0, ge=0, description="Shadow blur radius")
    color: str = Field(default="#00000020", description="Shadow color (hex with alpha)")


class ElementStyling(BaseModel):
    """Styling properties for elements"""
    font_family: Optional[str] = Field(default="Arial, Helvetica, sans-serif")
    font_size: Optional[int] = Field(default=24, ge=8, le=200)
    font_weight: Optional[FontWeight] = Field(default=FontWeight.NORMAL)
    line_height: Optional[float] = Field(default=1.2, ge=0.5, le=3.0)
    letter_spacing: Optional[float] = Field(default=0)
    text_align: Optional[TextAlign] = Field(default=TextAlign.LEFT)
    color: Optional[str] = Field(default="#000000", description="Text/foreground color")
    background_color: Optional[str] = Field(default="transparent", description="Background color")
    border_radius: Optional[int] = Field(default=0, ge=0)
    padding: Optional[Padding] = Field(default_factory=Padding)
    shadow: Optional[Shadow] = Field(default=None)
    opacity: Optional[float] = Field(default=1.0, ge=0.0, le=1.0)


class Background(BaseModel):
    """Canvas background properties"""
    type: BackgroundType
    value: str = Field(..., description="Color hex code or image URL")
    gradient_direction: Optional[GradientDirection] = None
    gradient_colors: Optional[List[str]] = None


class AdElement(BaseModel):
    """Individual ad element"""
    id: str = Field(..., description="Unique element identifier")
    type: ElementType
    content: Optional[str] = Field(default="", description="Text content or image reference")
    position: Position
    styling: Optional[ElementStyling] = Field(default_factory=ElementStyling)
    z_index: int = Field(default=1, description="Layer order")
    design_purpose: Optional[str] = Field(default="", description="Why this element exists")


class DesignStrategy(BaseModel):
    """Design strategy and psychology analysis"""
    primary_emotion: str = Field(..., description="Primary emotion the design evokes")
    visual_flow: str = Field(..., description="How the eye moves through the design")
    key_success_factors: List[str] = Field(default_factory=list, description="What makes this ad work")
    brand_signals: str = Field(..., description="What this design communicates about the brand")
    adaptation_notes: str = Field(..., description="Key things to preserve when adapting")


class Canvas(BaseModel):
    """Canvas properties"""
    width: int = Field(..., gt=0, le=2048)
    height: int = Field(..., gt=0, le=2048)
    background: Background


class AdStructure(BaseModel):
    """Complete ad structure"""
    model_config = ConfigDict(extra="forbid")
    
    canvas: Canvas
    elements: List[AdElement]
    design_strategy: DesignStrategy


# API Request/Response Models

class AnalysisResponse(BaseModel):
    """Response from ad analysis"""
    success: bool
    analysis: Optional[str] = None
    structure: Optional[AdStructure] = None
    error: Optional[str] = None
    processing_time: Optional[float] = None


class BrandAssetVariants(BaseModel):
    """Available variants for brand assets"""
    original: str
    transparent: str
    white: str
    black: str
    high_contrast: str


class ProcessedBrandAssets(BaseModel):
    """Processed brand assets response"""
    success: bool
    logo_variants: Optional[List[str]] = None
    product_variants: Optional[List[str]] = None
    brand_colors: Optional[List[str]] = None
    asset_ids: Optional[Dict[str, str]] = None
    error: Optional[str] = None


class TextReplacement(BaseModel):
    """Text replacement mapping"""
    element_id: str
    new_text: str


class GenerationRequest(BaseModel):
    """Ad generation request"""
    original_structure: AdStructure
    brand_asset_ids: Dict[str, str]
    text_replacements: Optional[Dict[str, str]] = Field(default_factory=dict)
    primary_color: str = Field(default="#000000")
    company_name: str = Field(default="")


class GenerationResponse(BaseModel):
    """Ad generation response"""
    success: bool
    ad_url: Optional[str] = None
    design_notes: Optional[str] = None
    structure: Optional[AdStructure] = None
    error: Optional[str] = None
    processing_time: Optional[float] = None


# Configuration Models

class AppConfig(BaseModel):
    """Application configuration"""
    app_name: str = "AdMimic"
    app_version: str = "1.0.0"
    debug: bool = False
    openai_api_key: str
    max_file_size_mb: int = 10
    allowed_image_types: List[str] = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    upload_dir: str = "./uploads"
    temp_dir: str = "./temp"
    max_canvas_size: int = 2048
    cors_origins: List[str] = ["*"]


# Error Models

class ErrorDetail(BaseModel):
    """Detailed error information"""
    code: str
    message: str
    field: Optional[str] = None


class ErrorResponse(BaseModel):
    """Standard error response"""
    success: bool = False
    error: str
    details: Optional[List[ErrorDetail]] = None
    timestamp: Optional[str] = None
    