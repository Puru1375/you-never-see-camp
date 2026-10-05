output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_app_subnet_ids" {
  value = module.vpc.private_app_subnet_ids
}

output "private_db_subnet_ids" {
  value = module.vpc.private_db_subnet_ids
}

output "alb_security_group_id" {
  value = module.security.alb_security_group_id
}

output "app_security_group_id" {
  value = module.security.app_security_group_id
}

output "db_endpoint" {
  value = module.rds.db_endpoint
}

output "db_port" {
  value = module.rds.db_port
}

output "db_name" {
  value = module.rds.db_name
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = module.ec2.instance_id
}

output "ec2_private_ip" {
  description = "EC2 private IP"
  value       = module.ec2.instance_private_ip
}

output "ec2_private_dns" {
  description = "EC2 private DNS"
  value       = module.ec2.instance_private_dns
}

output "ec2_instance_type" {
  description = "EC2 instance type"
  value       = module.ec2.instance_type
}

output "ec2_iam_role" {
  description = "EC2 IAM role"
  value       = module.ec2.iam_role_name
}

output "ec2_security_group_id" {
  description = "EC2 application security group"
  value       = module.ec2.security_group_id
}

output "secret_arn" {
  description = "ARN of application Secrets Manager secret"
  value       = module.secrets.secret_arn
}

output "secret_name" {
  description = "Name of application Secrets Manager secret"
  value       = module.secrets.secret_name
}