terraform {
  required_version = ">= 1.9"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
  backend "s3" {
    bucket         = "reputation-passport-tfstate"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "reputation-passport-tfstate-lock"
  }
}

provider "aws" {
  region = var.aws_region
}

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_ca_cert)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
  }
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_ca_cert)
    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
    }
  }
}

variable "aws_region" {
  default = "us-east-1"
}

variable "environment" {
  default = "dev"
}

module "vpc" {
  source = "../modules/vpc"
  environment = var.environment
  vpc_cidr   = "10.0.0.0/16"
}

module "eks" {
  source      = "../modules/eks"
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  node_groups = {
    general = {
      instance_types = ["t3.medium"]
      min_size      = 2
      max_size      = 6
      desired_size  = 2
    }
    gpu = {
      instance_types = ["g5.xlarge"]
      min_size      = 1
      max_size      = 3
      desired_size  = 1
    }
  }
}

module "rds" {
  source      = "../modules/rds"
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
}

module "elasticache" {
  source      = "../modules/elasticache"
  environment = var.environment
  subnet_ids  = module.vpc.private_subnet_ids
}

module "s3" {
  source      = "../modules/s3"
  environment = var.environment
}

module "ecr" {
  source      = "../modules/ecr"
  environment = var.environment
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "rds_endpoint" {
  value = module.rds.endpoint
}
