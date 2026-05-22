variable "environment" {}

locals {
  repositories = ["go-api", "rust-data", "python-ai", "nginx-pqc", "quantum"]
}

resource "aws_ecr_repository" "main" {
  for_each = toset(local.repositories)
  name                 = "reputation-passport/${each.key}"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.environment != "prod"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "main" {
  for_each = aws_ecr_repository.main
  repository = each.value.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}
