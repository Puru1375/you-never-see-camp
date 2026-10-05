module "vpc" {
  source = "../../modules/vpc"

  project_name = var.project_name
  environment  = var.environment

  vpc_cidr = "10.0.0.0/16"

  availability_zones = [
    "ap-south-1a",
    "ap-south-1b"
  ]
}


module "security" {
  source = "../../modules/security"

  project_name = var.project_name
  environment  = var.environment

  vpc_id = module.vpc.vpc_id
}


module "rds" {
  source = "../../modules/rds"

  project_name = var.project_name
  environment  = var.environment

  vpc_id                = module.vpc.vpc_id
  private_db_subnet_ids = module.vpc.private_db_subnet_ids

  app_security_group_id = module.security.app_security_group_id

  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
}

module "ec2" {
  source = "../../modules/ec2"

  project_name = var.project_name

  environment = var.environment

  vpc_id = module.vpc.vpc_id

  private_app_subnet_id = module.vpc.private_app_subnet_ids[0]

  app_security_group_id = module.security.app_security_group_id

  ami_id = var.ami_id

  instance_type = var.instance_type

  repository_url = var.repository_url

  app_port = 5000

  app_secret_arn = module.secrets.secret_arn

  aws_region = "ap-south-1"

  depends_on = [
    module.rds,
    module.secrets
  ]
}

module "secrets" {
  source = "../../modules/secrets"

  project_name = var.project_name
  environment  = var.environment
}
