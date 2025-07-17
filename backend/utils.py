"""
Utility functions for AdMimic
Common functions for file handling, validation, and error management
"""

import os
import uuid
import time
import hashlib
import logging
from typing import Optional, Dict, Any, List, Tuple
from pathlib import Path
import tempfile
import shutil
from contextlib import contextmanager

from PIL import Image
from fastapi import UploadFile, HTTPException

logger = logging.getLogger(__name__)


class FileManager:
    """
    File management utilities with automatic cleanup and validation
    """
    
    def __init__(self, base_dir: str = "./temp"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self._temp_files: List[str] = []
    
    @contextmanager
    def temp_file(self, suffix: str = "", prefix: str = "admimics_"):
        """Context manager for temporary files with automatic cleanup"""
        temp_file = tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix,
            prefix=prefix,
            dir=self.base_dir
        )
        temp_path = temp_file.name
        temp_file.close()
        
        self._temp_files.append(temp_path)
        
        try:
            yield temp_path
        finally:
            self.cleanup_file(temp_path)
    
    def save_upload(self, upload_file: UploadFile, 
                   directory: str = None, filename: str = None) -> str:
        """Save uploaded file and return path"""
        try:
            # Determine save directory
            save_dir = Path(directory) if directory else self.base_dir
            save_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate filename if not provided
            if not filename:
                timestamp = int(time.time())
                unique_id = str(uuid.uuid4())[:8]
                ext = Path(upload_file.filename or "file").suffix
                filename = f"{timestamp}_{unique_id}{ext}"
            
            # Save file
            file_path = save_dir / filename
            
            with open(file_path, "wb") as f:
                shutil.copyfileobj(upload_file.file, f)
            
            logger.debug(f"Saved upload to: {file_path}")
            return str(file_path)
            
        except Exception as e:
            logger.error(f"Failed to save upload: {e}")
            raise HTTPException(status_code=500, detail=f"File save failed: {str(e)}")
    
    def cleanup_file(self, file_path: str):
        """Safely remove a file"""
        try:
            if os.path.exists(file_path):
                os.unlink(file_path)
                logger.debug(f"Cleaned up file: {file_path}")
                
                # Remove from tracking list
                if file_path in self._temp_files:
                    self._temp_files.remove(file_path)
        except Exception as e:
            logger.warning(f"Failed to cleanup file {file_path}: {e}")
    
    def cleanup_directory(self, directory: str, ignore_errors: bool = True):
        """Safely remove a directory and all contents"""
        try:
            if os.path.exists(directory):
                shutil.rmtree(directory, ignore_errors=ignore_errors)
                logger.debug(f"Cleaned up directory: {directory}")
        except Exception as e:
            logger.warning(f"Failed to cleanup directory {directory}: {e}")
    
    def cleanup_all(self):
        """Clean up all tracked temporary files"""
        for file_path in self._temp_files.copy():
            self.cleanup_file(file_path)


class ImageValidator:
    """
    Image file validation and analysis
    """
    
    ALLOWED_TYPES = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/webp': ['.webp'],
        'image/gif': ['.gif']
    }
    
    @classmethod
    def validate_upload(cls, upload_file: UploadFile, 
                       max_size_mb: int = 10) -> Dict[str, Any]:
        """
        Comprehensive validation of uploaded image file
        
        Returns:
            Dictionary with validation results and file info
        """
        result = {
            'valid': False,
            'errors': [],
            'info': {}
        }
        
        try:
            # Check if file exists
            if not upload_file.filename:
                result['errors'].append("No filename provided")
                return result
            
            # Check content type
            if not upload_file.content_type:
                result['errors'].append("No content type provided")
                return result
            
            if upload_file.content_type not in cls.ALLOWED_TYPES:
                result['errors'].append(f"Invalid content type: {upload_file.content_type}")
                return result
            
            # Check file extension
            file_ext = Path(upload_file.filename).suffix.lower()
            allowed_exts = cls.ALLOWED_TYPES[upload_file.content_type]
            
            if file_ext not in allowed_exts:
                result['errors'].append(f"File extension {file_ext} doesn't match content type")
                return result
            
            # Check file size (if available)
            if hasattr(upload_file, 'size') and upload_file.size:
                size_mb = upload_file.size / (1024 * 1024)
                if size_mb > max_size_mb:
                    result['errors'].append(f"File too large: {size_mb:.1f}MB > {max_size_mb}MB")
                    return result
                
                result['info']['size_mb'] = size_mb
            
            # Basic image validation (requires reading file)
            # Note: This moves the file pointer, so it should be reset afterward
            try:
                upload_file.file.seek(0)
                with Image.open(upload_file.file) as img:
                    result['info'].update({
                        'width': img.width,
                        'height': img.height,
                        'mode': img.mode,
                        'format': img.format
                    })
                    
                    # Check dimensions
                    if img.width < 50 or img.height < 50:
                        result['errors'].append(f"Image too small: {img.width}x{img.height}")
                        return result
                    
                    if img.width > 4096 or img.height > 4096:
                        result['errors'].append(f"Image too large: {img.width}x{img.height}")
                        return result
                
                upload_file.file.seek(0)  # Reset file pointer
                
            except Exception as e:
                result['errors'].append(f"Invalid image file: {str(e)}")
                return result
            
            result['valid'] = True
            logger.debug(f"Image validation passed: {upload_file.filename}")
            
        except Exception as e:
            result['errors'].append(f"Validation error: {str(e)}")
            logger.error(f"Image validation failed: {e}")
        
        return result
    
    @classmethod
    def get_image_info(cls, file_path: str) -> Dict[str, Any]:
        """Get detailed information about an image file"""
        try:
            with Image.open(file_path) as img:
                return {
                    'width': img.width,
                    'height': img.height,
                    'mode': img.mode,
                    'format': img.format,
                    'size_bytes': os.path.getsize(file_path),
                    'aspect_ratio': img.width / img.height
                }
        except Exception as e:
            logger.error(f"Failed to get image info for {file_path}: {e}")
            return {}


class SessionManager:
    """
    Simple session management with automatic cleanup
    """
    
    def __init__(self, timeout_hours: int = 24, max_sessions: int = 1000):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.timeout_seconds = timeout_hours * 3600
        self.max_sessions = max_sessions
    
    def create_session(self, data: Dict[str, Any] = None) -> str:
        """Create new session and return session ID"""
        # Cleanup old sessions first
        self._cleanup_expired_sessions()
        
        # Check session limit
        if len(self.sessions) >= self.max_sessions:
            self._cleanup_oldest_sessions(keep=self.max_sessions - 1)
        
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            'created_at': time.time(),
            'last_accessed': time.time(),
            'data': data or {}
        }
        
        logger.debug(f"Created session: {session_id}")
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data if it exists and is valid"""
        if session_id not in self.sessions:
            return None
        
        session = self.sessions[session_id]
        
        # Check if session expired
        if time.time() - session['last_accessed'] > self.timeout_seconds:
            self.delete_session(session_id)
            return None
        
        # Update last accessed
        session['last_accessed'] = time.time()
        return session['data']
    
    def update_session(self, session_id: str, data: Dict[str, Any]) -> bool:
        """Update session data"""
        if session_id not in self.sessions:
            return False
        
        self.sessions[session_id]['data'].update(data)
        self.sessions[session_id]['last_accessed'] = time.time()
        return True
    
    def delete_session(self, session_id: str) -> bool:
        """Delete session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.debug(f"Deleted session: {session_id}")
            return True
        return False
    
    def _cleanup_expired_sessions(self):
        """Remove expired sessions"""
        current_time = time.time()
        expired_sessions = []
        
        for session_id, session in self.sessions.items():
            if current_time - session['last_accessed'] > self.timeout_seconds:
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            self.delete_session(session_id)
        
        if expired_sessions:
            logger.info(f"Cleaned up {len(expired_sessions)} expired sessions")
    
    def _cleanup_oldest_sessions(self, keep: int):
        """Keep only the most recent sessions"""
        if len(self.sessions) <= keep:
            return
        
        # Sort by last accessed time
        sorted_sessions = sorted(
            self.sessions.items(),
            key=lambda x: x[1]['last_accessed'],
            reverse=True
        )
        
        # Keep the most recent ones
        sessions_to_keep = dict(sorted_sessions[:keep])
        sessions_to_remove = [sid for sid in self.sessions if sid not in sessions_to_keep]
        
        for session_id in sessions_to_remove:
            self.delete_session(session_id)
        
        self.sessions = sessions_to_keep
        logger.info(f"Cleaned up {len(sessions_to_remove)} old sessions")


class ColorUtils:
    """
    Color utility functions for design processing
    """
    
    @staticmethod
    def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        if len(hex_color) == 3:
            hex_color = ''.join([c*2 for c in hex_color])
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    @staticmethod
    def rgb_to_hex(rgb: Tuple[int, int, int]) -> str:
        """Convert RGB tuple to hex color"""
        return f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"
    
    @staticmethod
    def get_contrast_ratio(color1: str, color2: str) -> float:
        """Calculate contrast ratio between two colors"""
        def get_luminance(color):
            rgb = ColorUtils.hex_to_rgb(color)
            rgb_norm = [c / 255.0 for c in rgb]
            rgb_gamma = [
                c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
                for c in rgb_norm
            ]
            return 0.2126 * rgb_gamma[0] + 0.7152 * rgb_gamma[1] + 0.0722 * rgb_gamma[2]
        
        l1 = get_luminance(color1)
        l2 = get_luminance(color2)
        
        lighter = max(l1, l2)
        darker = min(l1, l2)
        
        return (lighter + 0.05) / (darker + 0.05)
    
    @staticmethod
    def is_light_color(color: str) -> bool:
        """Determine if a color is light or dark"""
        rgb = ColorUtils.hex_to_rgb(color)
        # Calculate perceived brightness
        brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000
        return brightness > 127


def generate_file_hash(file_path: str) -> str:
    """Generate SHA-256 hash of file contents"""
    try:
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    except Exception as e:
        logger.error(f"Failed to generate hash for {file_path}: {e}")
        return ""


def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    # Remove or replace unsafe characters
    unsafe_chars = '<>:"/\\|?*'
    sanitized = filename
    
    for char in unsafe_chars:
        sanitized = sanitized.replace(char, '_')
    
    # Remove leading/trailing spaces and dots
    sanitized = sanitized.strip(' .')
    
    # Ensure filename is not empty
    if not sanitized:
        sanitized = "unnamed_file"
    
    return sanitized


def get_file_type_from_content(file_path: str) -> Optional[str]:
    """Determine file type from content (magic numbers)"""
    try:
        with open(file_path, 'rb') as f:
            header = f.read(8)
        
        # Common image file signatures
        if header.startswith(b'\xFF\xD8\xFF'):
            return 'image/jpeg'
        elif header.startswith(b'\x89PNG\r\n\x1a\n'):
            return 'image/png'
        elif header.startswith(b'RIFF') and header[8:12] == b'WEBP':
            return 'image/webp'
        elif header.startswith(b'GIF8'):
            return 'image/gif'
        
        return None
        
    except Exception as e:
        logger.error(f"Failed to determine file type for {file_path}: {e}")
        return None
        