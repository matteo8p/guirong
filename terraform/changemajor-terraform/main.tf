# Variables

variable "aws_region" {}

variable "deploy_stage" {}

variable "mulesoft_url" {}

variable "elasticsearch_url" {}

variable "vault_addr" {}
variable "vault_token" {}

variable "admin_role_arn" {}

variable "app_tags" {
  type = map(string)
}

terraform {
  backend "s3" {
  }
}

provider "aws" {
  #version = "~> 2.7"
  region = var.aws_region

  assume_role {
    role_arn = var.admin_role_arn
  }
}

module "changemajor" {
  source            = "./modules/changemajor"
  deploy_stage      = terraform.workspace == "default" ? "prod" : terraform.workspace
  aws_region        = var.aws_region
  elasticsearch_url = var.elasticsearch_url
  mulesoft_url      = var.mulesoft_url
  vault_addr        = var.vault_addr
  vault_token       = var.vault_token
  app_tags          = var.app_tags

  #resource_tags = merge(
  #  var.app_tags,
  #    {
  #      "Repo" = "https://github.com/ASU/eadv-change-major"
  #    },
  #    var.default_tags,
  #  )
}

output "cloudfront-domain-name" {
  value       = module.changemajor.cloudfront-domain-name
  description = "Domain name corresponding to the distribution"
}

