variable "environment" {}
variable "vpc_id" {}
variable "subnet_ids" { type = list(string) }

resource "aws_db_subnet_group" "main" {
  name       = "reputation-passport-${var.environment}"
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "rds" {
  name   = "reputation-passport-${var.environment}-rds"
  vpc_id = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }
}

resource "aws_db_instance" "main" {
  identifier        = "reputation-passport-${var.environment}"
  engine            = "postgres"
  engine_version    = "16.3"
  instance_class    = "db.t3.medium"
  allocated_storage = 100
  storage_encrypted = true

  db_name  = "reputation_passport"
  username = "reputation_admin"
  password = random_password.rds.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-05:00"

  deletion_protection = true
  skip_final_snapshot = var.environment == "prod" ? false : true

  tags = {
    Environment = var.environment
  }
}

resource "random_password" "rds" {
  length  = 24
  special = false
}

resource "aws_secretsmanager_secret" "rds" {
  name = "reputation-passport-${var.environment}-rds"
}

resource "aws_secretsmanager_secret_version" "rds" {
  secret_id = aws_secretsmanager_secret.rds.id
  secret_string = jsonencode({
    host     = aws_db_instance.main.address
    port     = aws_db_instance.main.port
    database = aws_db_instance.main.db_name
    username = aws_db_instance.main.username
    password = random_password.rds.result
  })
}

output "endpoint" {
  value = aws_db_instance.main.address
}

output "secret_arn" {
  value = aws_secretsmanager_secret.rds.arn
}
