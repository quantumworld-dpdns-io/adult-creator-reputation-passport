variable "environment" {}
variable "subnet_ids" { type = list(string) }

resource "aws_elasticache_subnet_group" "main" {
  name       = "reputation-passport-${var.environment}"
  subnet_ids = var.subnet_ids
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = "reputation-passport-${var.environment}"
  engine               = "redis"
  engine_version       = "7.1"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name

  tags = {
    Environment = var.environment
  }
}
