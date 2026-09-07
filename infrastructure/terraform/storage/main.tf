terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "camp_images" {
  bucket = var.bucket_name

  tags = {
    Project     = "You Never See Camp"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Purpose     = "Website Images"
  }
}

resource "aws_s3_bucket_public_access_block" "camp_images" {
  bucket = aws_s3_bucket.camp_images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "camp_images" {
  bucket = aws_s3_bucket.camp_images.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "camp_images" {
  bucket = aws_s3_bucket.camp_images.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "camp_images" {
  bucket = aws_s3_bucket.camp_images.id

  cors_rule {
    allowed_methods = [
      "GET",
      "PUT"
    ]

    allowed_origins = [
      "http://localhost:5173"
    ]

    allowed_headers = [
      "*"
    ]

    expose_headers = [
      "ETag"
    ]

    max_age_seconds = 3600
  }
}