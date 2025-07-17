"""
Configuration management for AdMimic
Handles environment variables, validation, and application settings
"""

import os
import logging
from typing import List, Optional
from pathlib import Path
from pydantic import BaseSettings, Field, validator
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """
    Application settings with validation and environment variable support
    """
    
    # Application Info
    app_name: str = Field(default="AdMimic", env="APP_NAME")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    debug: bool = Field(default=False, env="DEBUG")
    
    # Server Configuration
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    
    # API Keys
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    
    # CORS Settings
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"],
        env="CORS_ORIGINS"
    )
    cors_allow_credentials: bool = Field(default=True, env="CORS_ALLOW_CREDENTIALS")
    
    # File Upload Settings
    max_file_size_mb: int = Field(default=10, env="MAX_FILE_SIZE_MB")
    allowed_image_types: List[str] = Field(
        default=["image/jpeg", "image/jpg", "image/png", "image/webp"],
        env="ALLOWED_IMAGE_TYPES"
    )
    
    # Directory Settings
    upload_dir: str = Field(default="./uploads", env="UPLOAD_DIR")
    temp_dir: str = Field(default="./temp", env="TEMP_DIR")
    assets_dir: str = Field(default="./assets", env="ASSETS_DIR")
    generated_dir: str = Field(default="./generated", env="GENERATED_DIR")
    fonts_dir: str = Field(default="./fonts", env="FONTS_DIR")
    logs_dir: str = Field(default="./logs", env="LOGS_DIR")
    
    # Processing Settings
    max_canvas_size: int = Field(default=2048, env="MAX_CANVAS_SIZE")
    default_font_size: int = Field(default=24, env="DEFAULT_FONT_SIZE")
    min_font_size: int = Field(default=8, env="MIN_FONT_SIZE")
    max_font_size: int = Field(default=200, env="MAX_FONT_SIZE")
    
    # Session Management
    session_timeout_hours: int = Field(default=24, env="SESSION_TIMEOUT_HOURS")
    max_sessions: int = Field(default=1000, env="MAX_SESSIONS")
    
    # Rate Limiting
    requests_per_minute: int = Field(default=30, env="REQUESTS_PER_MINUTE")
    burst_limit: int = Field(default=10, env="BURST_LIMIT")
    
    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(default="json", env="LOG_FORMAT")
    
    # OpenAI Settings
    openai_model: str = Field(default="gpt-4o", env="OPENAI_MODEL")
    openai_max_tokens: int = Field(default=4000, env="OPENAI_MAX_TOKENS")
    openai_temperature: float = Field(default=0.3, env="OPENAI_TEMPERATURE")
    
    @validator('openai_api_key')
    def validate_openai_key(cls, v):
        """Validate OpenAI API key"""
        if not v or v == "your_openai_api_key_here":
            logger.warning("OpenAI API key not properly configured")
        return v
    
    @validator('cors_origins', pre=True)
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    @validator('allowed_image_types', pre=True)
    def parse_image_types(cls, v):
        """Parse allowed image types from string or list"""
        if isinstance(v, str):
            return [img_type.strip() for img_type in v.split(',')]
        return v
    
    @validator('log_level')
    def validate_log_level(cls, v):
        """Validate log level"""
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in valid_levels:
            raise ValueError(f'Invalid log level. Must be one of: {valid_levels}')
        return v.upper()
    
    def create_directories(self):
        """Create necessary directories"""
        directories = [
            self.upload_dir,
            self.temp_dir,
            self.assets_dir,
            self.generated_dir,
            self.fonts_dir,
            self.logs_dir
        ]
        
        for directory in directories:
            path = Path(directory)
            path.mkdir(parents=True, exist_ok=True)
            logger.info(f"Ensured directory exists: {path.absolute()}")
    
    def get_file_size_bytes(self) -> int:
        """Get max file size in bytes"""
        return self.max_file_size_mb * 1024 * 1024
    
    def is_allowed_image_type(self, content_type: str) -> bool:
        """Check if image type is allowed"""
        return content_type in self.allowed_image_types
    
    def get_session_timeout_seconds(self) -> int:
        """Get session timeout in seconds"""
        return self.session_timeout_hours * 3600
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


def get_settings() -> Settings:
    """Get application settings singleton"""
    return Settings()


def setup_logging(settings: Settings):
    """Setup application logging"""
    log_level = getattr(logging, settings.log_level)
    
    # Create logs directory
    Path(settings.logs_dir).mkdir(parents=True, exist_ok=True)
    
    # Configure logging format
    if settings.log_format.lower() == "json":
        # JSON structured logging
        import structlog
        
        structlog.configure(
            processors=[
                structlog.stdlib.filter_by_level,
                structlog.stdlib.add_logger_name,
                structlog.stdlib.add_log_level,
                structlog.stdlib.PositionalArgumentsFormatter(),
                structlog.processors.TimeStamper(fmt="iso"),
                structlog.processors.StackInfoRenderer(),
                structlog.processors.format_exc_info,
                structlog.processors.UnicodeDecoder(),
                structlog.processors.JSONRenderer()
            ],
            context_class=dict,
            logger_factory=structlog.stdlib.LoggerFactory(),
            wrapper_class=structlog.stdlib.BoundLogger,
            cache_logger_on_first_use=True,
        )
        
        # Setup standard logging to use structlog
        logging.basicConfig(
            format="%(message)s",
            level=log_level,
            handlers=[
                logging.StreamHandler(),
                logging.FileHandler(f"{settings.logs_dir}/admimics.log")
            ]
        )
    else:
        # Standard text logging
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(),
                logging.FileHandler(f"{settings.logs_dir}/admimics.log")
            ]
        )
    
    logger.info(f"Logging configured with level: {settings.log_level}")


def validate_environment():
    """Validate critical environment variables and settings"""
    settings = get_settings()
    issues = []
    
    # Check OpenAI API key
    if not settings.openai_api_key or settings.openai_api_key == "your_openai_api_key_here":
        issues.append("OpenAI API key not configured")
    
    # Check directory permissions
    critical_dirs = [settings.upload_dir, settings.temp_dir, settings.generated_dir]
    for directory in critical_dirs:
        path = Path(directory)
        try:
            path.mkdir(parents=True, exist_ok=True)
            # Test write permission
            test_file = path / "test_write_permission"
            test_file.write_text("test")
            test_file.unlink()
        except Exception as e:
            issues.append(f"Cannot write to directory {directory}: {e}")
    
    # Log issues
    if issues:
        logger.warning("Environment validation issues found:")
        for issue in issues:
            logger.warning(f"  - {issue}")
        
        if any("OpenAI" in issue for issue in issues):
            logger.error("Critical: OpenAI API key required for core functionality")
    else:
        logger.info("Environment validation passed")
    
    return len(issues) == 0


# Create global settings instance
settings = get_settings()
