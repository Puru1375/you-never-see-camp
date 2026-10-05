variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_app_subnet_id" {
  description = "Private application subnet ID"
  type        = string
}

variable "app_security_group_id" {
  description = "Application security group ID"
  type        = string
}

variable "ami_id" {
  description = "AMI ID for EC2"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "repository_url" {
  description = "Git repository URL"
  type        = string
}

variable "app_port" {
  description = "Application port"
  type        = number
  default     = 5000
}

variable "app_secret_arn" {
  description = "ARN of application Secrets Manager secret"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}