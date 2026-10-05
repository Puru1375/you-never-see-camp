resource "aws_instance" "app" {
  ami           = var.ami_id
  instance_type = var.instance_type

  subnet_id = var.private_app_subnet_id

  vpc_security_group_ids = [
    var.app_security_group_id
  ]

  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  user_data = templatefile(
    "${path.module}/user_data.sh",
    {
      repository_url = var.repository_url
      app_port       = var.app_port
      app_secret_arn = var.app_secret_arn
      aws_region     = var.aws_region
    }
  )

  user_data_replace_on_change = true

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-backend"
    Environment = var.environment
    Project     = var.project_name
  }
}