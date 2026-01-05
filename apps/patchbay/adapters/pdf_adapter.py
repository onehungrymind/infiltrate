"""PDF document adapter."""
import requests
from pathlib import Path
from datetime import datetime
from PyPDF2 import PdfReader
from .base_adapter import BaseAdapter, ExtractionError
from models.raw_content import RawContent, RawContentBatch
from python_shared.utils import generate_id


class PDFAdapter(BaseAdapter):
    """Adapter for PDF documents."""
    
    @property
    def adapter_type(self) -> str:
        return "pdf"
    
    def validate_url(self, url: str) -> bool:
        """Check if URL points to a PDF."""
        return url.lower().endswith('.pdf')
    
    def extract(self, url: str) -> RawContentBatch:
        """Extract text from PDF."""
        try:
            # Download PDF if it's a URL
            if url.startswith(('http://', 'https://')):
                response = requests.get(url, timeout=60)
                response.raise_for_status()
                
                # Save temporarily
                temp_path = Path(f"/tmp/{generate_id()}.pdf")
                temp_path.write_bytes(response.content)
                pdf_path = temp_path
            else:
                pdf_path = Path(url)
            
            # Extract text
            reader = PdfReader(pdf_path)
            
            # Extract metadata
            metadata = reader.metadata
            title = metadata.title if metadata and metadata.title else pdf_path.stem
            author = metadata.author if metadata and metadata.author else None
            
            # Extract text from all pages
            text_content = []
            for page in reader.pages:
                text_content.append(page.extract_text())
            
            content = "\n\n".join(text_content)
            
            if not content.strip():
                raise ExtractionError("No text could be extracted from PDF")
            
            raw_content = RawContent(
                id=generate_id(),
                source_type=self.adapter_type,
                source_url=url,
                title=title,
                content=content,
                author=author,
                metadata={
                    'pages': len(reader.pages),
                    'creator': metadata.creator if metadata and metadata.creator else None,
                    'producer': metadata.producer if metadata and metadata.producer else None,
                }
            )
            
            # Clean up temp file
            if url.startswith(('http://', 'https://')):
                temp_path.unlink(missing_ok=True)
            
            return RawContentBatch(
                items=[raw_content],
                total=1,
                source_type=self.adapter_type
            )
            
        except Exception as e:
            raise ExtractionError(f"PDF extraction failed: {str(e)}")

