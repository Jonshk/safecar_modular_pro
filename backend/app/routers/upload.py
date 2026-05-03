from fastapi import APIRouter, UploadFile, File, HTTPException
import os, uuid
import cloudinary
import cloudinary.uploader

router = APIRouter(prefix="/upload", tags=["upload"])

# ── Cloudinary config ──────────────────────────────────────
cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "dqerjbatr"),
    api_key    = os.getenv("CLOUDINARY_API_KEY",    "319357858337649"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET", "HWQp0TVcLzHevovtJV6WNaLN3tk"),
    secure     = True,
)

ALLOWED  = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED:
        raise HTTPException(400, "Only JPEG, PNG, WebP and GIF allowed")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(400, "File too large — max 5MB")

    try:
        # public_id único para evitar colisiones
        public_id = f"safecar/{uuid.uuid4().hex}"
        result = cloudinary.uploader.upload(
            content,
            public_id     = public_id,
            overwrite     = False,
            resource_type = "image",
            # Optimización automática
            transformation = [
                {"quality": "auto", "fetch_format": "auto"}
            ],
        )
        return {
            "url":       result["secure_url"],
            "public_id": result["public_id"],
            "filename":  result["public_id"].split("/")[-1],
        }
    except Exception as e:
        raise HTTPException(500, f"Upload failed: {str(e)}")


@router.delete("/image/{public_id:path}")
async def delete_image(public_id: str):
    try:
        cloudinary.uploader.destroy(f"safecar/{public_id}")
        return {"deleted": True}
    except Exception as e:
        raise HTTPException(500, f"Delete failed: {str(e)}")