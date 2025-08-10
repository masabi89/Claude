variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-central-1"
}

variable "assets_bucket_name" {
  description = "S3 bucket for file storage"
  type        = string
}
