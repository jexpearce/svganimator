"""
AdMimic FastAPI Application
Main application with all endpoints for ad analysis, asset processing, and generation
"""

import os
import tempfile
import logging
import time
import uuid
from typing import Dict, List, Optional
from pathlib import Path
import aiofiles
import shutil
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError

# Import our services
from services.gpt_analyzer import GPTDesignAnalyzer
from services.asset_processor import BrandAssetProcessor
from services.ad_generator import GPTAdGenerator
from services.ad_renderer import AdRenderer

# Import models
from models.schemas import (
    AnalysisResponse, ProcessedBrandAssets, GenerationRequest, 
    GenerationResponse, ErrorResponse, AppConfig
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AdMimic API",
    description="Transform any ad into your branded version using AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration
config = AppConfig(
    openai_api_key=os.getenv("OPENAI_API_KEY"),
    debug=os.getenv("DEBUG", "False").lower() == "true",
    max_file_size_mb=int(os.getenv("MAX_FILE_SIZE_MB", "10")),
    upload_dir=os.getenv("UPLOAD_DIR", "./uploads"),
    temp_dir=os.getenv("TEMP_DIR", "./temp"),
    cors_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
Path(config.upload_dir).mkdir(parents=True, exist_ok=True)
Path(config.temp_dir).mkdir(parents=True, exist_ok=True)
Path("./generated").mkdir(parents=True, exist_ok=True)
Path("./assets").mkdir(parents=True, exist_ok=True)

# Mount static files for serving generated ads
app.mount("/generated", StaticFiles(directory="./generated"), name="generated")
app.mount("/assets", StaticFiles(directory="./assets"), name="assets")

# Initialize services
analyzer = GPTDesignAnalyzer(api_key=config.openai_api_key)
asset_processor = BrandAssetProcessor()
generator = GPTAdGenerator(api_key=config.openai_api_key)
renderer = AdRenderer(assets_dir="./assets")

# Global storage for session data (in production, use Redis or database)
sessions: Dict[str, Dict] = {}


def cleanup_temp_file(file_path: str):
    """Background task to cleanup temporary files"""
    try:
        if os.path.exists(file_path):
            os.unlink(file_path)
            logger.debug(f"Cleaned up temp file: {file_path}")
    except Exception as e:
        logger.warning(f"Failed to cleanup temp file {file_path}: {e}")


def validate_image_file(file: UploadFile) -> bool:
    """Validate uploaded image file"""
    # Check content type
    if not file.content_type or not file.content_type.startswith('image/'):
        return False
    
    # Check file extension
    if file.filename:
        ext = Path(file.filename).suffix.lower()
        if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
            return False
    
    return True


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "AdMimic API is running", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "gpt_analyzer": bool(config.openai_api_key and config.openai_api_key != "your_openai_api_key_here"),
            "asset_processor": True,
            "ad_generator": bool(config.openai_api_key and config.openai_api_key != "your_openai_api_key_here"),
            "renderer": True
        },
        "config": {
            "max_file_size_mb": config.max_file_size_mb,
            "debug": config.debug
        }
    }


@app.post("/analyze-ad", response_model=AnalysisResponse)
async def analyze_ad(
    background_tasks: BackgroundTasks,
    ad_image: UploadFile = File(..., description="Advertisement image to analyze")
):
    """
    Analyze uploaded ad and extract design intelligence
    
    This endpoint uses GPT-4o to understand the design psychology,
    visual hierarchy, and effectiveness factors of the uploaded ad.
    """
    try:
        logger.info(f"Starting ad analysis for file: {ad_image.filename}")
        
        # Validate file
        if not validate_image_file(ad_image):
            raise HTTPException(
                status_code=400,
                detail="Invalid image file. Please upload JPG, PNG, or WebP format."
            )
        
        # Check file size
        content = await ad_image.read()
        file_size_mb = len(content) / (1024 * 1024)
        
        if file_size_mb > config.max_file_size_mb:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size is {config.max_file_size_mb}MB."
            )
        
        # Save to temporary file
        temp_file = tempfile.NamedTemporaryFile(
            delete=False, 
            suffix=Path(ad_image.filename or "image.jpg").suffix,
            dir=config.temp_dir
        )
        
        temp_file.write(content)
        temp_file.close()
        
        # Schedule cleanup
        background_tasks.add_task(cleanup_temp_file, temp_file.name)
        
        # Analyze with GPT-4o
        logger.info("Performing GPT-4o analysis...")
        result = analyzer.analyze_ad(temp_file.name)
        
        # Store session data for later use
        if result.success and result.structure:
            session_id = str(uuid.uuid4())
            sessions[session_id] = {
                "analysis": result,
                "timestamp": time.time(),
                "original_filename": ad_image.filename
            }
            
            # Add session ID to response (in real app, use secure session management)
            response_dict = result.model_dump()
            response_dict["session_id"] = session_id
            
            return JSONResponse(response_dict)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ad analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/process-brand-assets", response_model=ProcessedBrandAssets)
async def process_brand_assets(
    background_tasks: BackgroundTasks,
    logo: Optional[UploadFile] = File(None, description="Brand logo image (optional)"),
    product_image: UploadFile = File(..., description="Product image"),
    primary_color: str = Form(..., description="Primary brand color (hex format)"),
    session_id: str = Form(..., description="Session ID from ad analysis")
):
    """
    Process brand assets for ad generation
    
    Creates multiple variants of logo and product images optimized
    for different contexts and extracts brand color palette.
    """
    try:
        logger.info(f"Processing brand assets for session: {session_id}")
        
        # Validate session
        if session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Validate logo file if provided
        if logo and not validate_image_file(logo):
            raise HTTPException(
                status_code=400,
                detail="Invalid logo file. Please upload JPG, PNG, or WebP format."
            )
        
        # Validate product image (required)
        if not validate_image_file(product_image):
            raise HTTPException(
                status_code=400,
                detail="Invalid product image file. Please upload JPG, PNG, or WebP format."
            )
        
        # Validate primary color
        if not primary_color.startswith('#') or len(primary_color) != 7:
            raise HTTPException(
                status_code=400,
                detail="Invalid color format. Use hex format like #FF0000"
            )
        
        # Create asset directory for this session
        asset_dir = Path("./assets") / session_id
        asset_dir.mkdir(parents=True, exist_ok=True)
        
        # Save and process logo if provided
        logo_variants = {}
        if logo:
            logo_content = await logo.read()
            logo_temp = tempfile.NamedTemporaryFile(
                delete=False, 
                suffix=Path(logo.filename or "logo.png").suffix,
                dir=config.temp_dir
            )
            logo_temp.write(logo_content)
            logo_temp.close()
            
            background_tasks.add_task(cleanup_temp_file, logo_temp.name)
            
            # Process logo variants
            logo_dir = asset_dir / "logo"
            logo_variants = asset_processor.process_logo(logo_temp.name, str(logo_dir))
        
        # Process product image if provided
        product_variants = {}
        if product_image and validate_image_file(product_image):
            product_content = await product_image.read()
            product_temp = tempfile.NamedTemporaryFile(
                delete=False,
                suffix=Path(product_image.filename or "product.png").suffix,
                dir=config.temp_dir
            )
            product_temp.write(product_content)
            product_temp.close()
            
            background_tasks.add_task(cleanup_temp_file, product_temp.name)
            
            # Process product variants
            product_dir = asset_dir / "product"
            product_variants = asset_processor.process_product_image(
                product_temp.name, str(product_dir)
            )
        
        # Extract brand colors from logo
        brand_colors = asset_processor.extract_brand_colors(logo_temp.name)
        
        # Ensure primary color is first
        if primary_color not in brand_colors:
            brand_colors.insert(0, primary_color)
        
        # Store assets in session
        sessions[session_id]["brand_assets"] = {
            "logo_variants": logo_variants,
            "product_variants": product_variants,
            "brand_colors": brand_colors,
            "primary_color": primary_color,
            "asset_dir": str(asset_dir)
        }
        
        logger.info(f"Successfully processed brand assets for session {session_id}")
        
        return ProcessedBrandAssets(
            success=True,
            logo_variants=list(logo_variants.keys()),
            product_variants=list(product_variants.keys()),
            brand_colors=brand_colors,
            asset_ids={"session_id": session_id}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Brand asset processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Asset processing failed: {str(e)}")


@app.post("/generate-ad", response_model=GenerationResponse)
async def generate_ad(request: GenerationRequest):
    """
    Generate new branded ad
    
    Uses GPT-4o to adapt the original design with new brand assets
    while preserving psychological effectiveness.
    """
    try:
        session_id = request.brand_asset_ids.get("session_id")
        
        if not session_id or session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session_data = sessions[session_id]
        
        if "brand_assets" not in session_data:
            raise HTTPException(status_code=400, detail="Brand assets not processed yet")
        
        logger.info(f"Generating ad for session: {session_id}")
        
        # Prepare user inputs
        user_inputs = {
            "text_replacements": request.text_replacements,
            "primary_color": request.primary_color,
            "company_name": request.company_name
        }
        
        # Generate with GPT-4o
        brand_assets_info = session_data["brand_assets"]
        
        generation_result = generator.generate_branded_ad(
            request.original_structure,
            brand_assets_info,
            user_inputs
        )
        
        if not generation_result.success:
            return generation_result
        
        # Render the final ad
        logger.info("Rendering final ad image...")
        
        # Prepare brand assets for renderer
        renderer_assets = {
            "logo": brand_assets_info["logo_variants"],
            "product": brand_assets_info["product_variants"]
        }
        
        # Generate unique filename
        output_filename = f"ad_{session_id}_{int(time.time())}.png"
        output_path = f"./generated/{output_filename}"
        
        # Render the ad
        render_success = renderer.render_ad(
            generation_result.structure,
            renderer_assets,
            output_path
        )
        
        if render_success:
            # Store generated ad info in session
            sessions[session_id]["generated_ad"] = {
                "filename": output_filename,
                "path": output_path,
                "structure": generation_result.structure,
                "design_notes": generation_result.design_notes
            }
            
            ad_url = f"/generated/{output_filename}"
            
            logger.info(f"Successfully generated ad: {ad_url}")
            
            return GenerationResponse(
                success=True,
                ad_url=ad_url,
                design_notes=generation_result.design_notes,
                structure=generation_result.structure,
                processing_time=generation_result.processing_time
            )
        else:
            raise HTTPException(status_code=500, detail="Ad rendering failed")
            
    except HTTPException:
        raise
    except ValidationError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid request data: {str(e)}")
    except Exception as e:
        logger.error(f"Ad generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@app.get("/download-ad/{session_id}")
async def download_ad(session_id: str):
    """
    Download generated ad as PNG file
    """
    try:
        if session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session_data = sessions[session_id]
        
        if "generated_ad" not in session_data:
            raise HTTPException(status_code=404, detail="No generated ad found")
        
        ad_info = session_data["generated_ad"]
        file_path = ad_info["path"]
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Generated ad file not found")
        
        return FileResponse(
            file_path,
            media_type="image/png",
            filename=f"admimiced_ad_{session_id}.png"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Download failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")


@app.get("/session/{session_id}")
async def get_session(session_id: str):
    """
    Get session information and status
    """
    try:
        if session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session_data = sessions[session_id].copy()
        
        # Remove sensitive data and large objects
        if "analysis" in session_data:
            analysis = session_data["analysis"]
            session_data["analysis_summary"] = {
                "success": analysis.success,
                "has_structure": bool(analysis.structure),
                "processing_time": analysis.processing_time
            }
            del session_data["analysis"]
        
        # Remove file paths for security
        if "brand_assets" in session_data:
            assets = session_data["brand_assets"].copy()
            assets.pop("asset_dir", None)
            for variant_dict in [assets.get("logo_variants", {}), assets.get("product_variants", {})]:
                for key in variant_dict:
                    variant_dict[key] = f"[ASSET:{key}]"
            session_data["brand_assets"] = assets
        
        return session_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Session retrieval failed: {str(e)}")


@app.delete("/session/{session_id}")
async def cleanup_session(session_id: str, background_tasks: BackgroundTasks):
    """
    Clean up session data and files
    """
    try:
        if session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session_data = sessions[session_id]
        
        # Schedule cleanup of asset files
        if "brand_assets" in session_data:
            asset_dir = session_data["brand_assets"].get("asset_dir")
            if asset_dir and os.path.exists(asset_dir):
                background_tasks.add_task(shutil.rmtree, asset_dir, ignore_errors=True)
        
        # Schedule cleanup of generated ad
        if "generated_ad" in session_data:
            ad_path = session_data["generated_ad"].get("path")
            if ad_path and os.path.exists(ad_path):
                background_tasks.add_task(cleanup_temp_file, ad_path)
        
        # Remove session
        del sessions[session_id]
        
        logger.info(f"Cleaned up session: {session_id}")
        
        return {"message": "Session cleaned up successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session cleanup failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.detail,
            timestamp=time.time()
        ).model_dump()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal server error",
            timestamp=time.time()
        ).model_dump()
    )


if __name__ == "__main__":
    import uvicorn
    
    # Configure uvicorn logging
    log_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            },
        },
        "handlers": {
            "default": {
                "formatter": "default",
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",
            },
        },
        "root": {
            "level": "INFO",
            "handlers": ["default"],
        },
    }
    
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        reload=config.debug,
        log_config=log_config
    )
