output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.app.id
}

output "instance_private_ip" {
  description = "Private IP of EC2"
  value       = aws_instance.app.private_ip
}

output "instance_private_dns" {
  description = "Private DNS of EC2"
  value       = aws_instance.app.private_dns
}

output "instance_type" {
  description = "EC2 instance type"
  value       = aws_instance.app.instance_type
}

output "iam_role_name" {
  description = "EC2 IAM role name"
  value       = aws_iam_role.ec2_role.name
}

output "security_group_id" {
  description = "Application security group ID"
  value       = var.app_security_group_id
}