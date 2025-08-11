terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" {
  region = var.region
}

# Example: S3 bucket for assets (adjust as needed)
resource "aws_s3_bucket" "assets" {
  bucket = var.assets_bucket_name
  force_destroy = false
}

output "assets_bucket" {
  value = aws_s3_bucket.assets.bucket
}
