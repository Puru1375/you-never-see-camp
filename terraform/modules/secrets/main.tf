resource "aws_secretsmanager_secret" "app" {
  name = "${var.project_name}/${var.environment}/app"

  description = "Application secrets for You Never See Camp"

  tags = {
    Name        = "${var.project_name}-${var.environment}-app-secrets"
    Project     = var.project_name
    Environment = var.environment
  }
}