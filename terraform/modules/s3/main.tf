variable "environment" {}

resource "aws_s3_bucket" "data_lake" {
  bucket = "reputation-passport-${var.environment}-data-lake"
  force_destroy = var.environment != "prod"
}

resource "aws_s3_bucket_versioning" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id
  versioning_configuration {
    status = var.environment == "prod" ? "Enabled" : "Suspended"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "data_lake" {
  bucket                  = aws_s3_bucket.data_lake.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id
  rule {
    id     = "expire-old-logs"
    status = "Enabled"
    expiration {
      days = 365
    }
  }
}

resource "aws_s3_bucket" "backup" {
  bucket = "reputation-passport-${var.environment}-backup"
  force_destroy = var.environment != "prod"
}

resource "aws_s3_bucket_versioning" "backup" {
  bucket = aws_s3_bucket.backup.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket" "public_assets" {
  bucket = "reputation-passport-${var.environment}-assets"
  force_destroy = var.environment != "prod"
}

resource "aws_s3_bucket_policy" "public_assets" {
  bucket = aws_s3_bucket.public_assets.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.public_assets.arn}/*"
      Condition = {
        StringEquals = {
          "s3:ExistingObjectTag/public" = "true"
        }
      }
    }]
  })
}
