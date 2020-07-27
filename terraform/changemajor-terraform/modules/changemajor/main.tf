# Variables

variable "aws_region" {}

variable "deploy_stage" {}

variable "mulesoft_url" {}

variable "elasticsearch_url" {}

variable "vault_addr" {}
variable "vault_token" {}

variable "app_tags" {
  type = map(string)
}

provider "vault" {
  version = "~> 2.0.0"
  address = var.vault_addr
  token   = var.vault_token
}


resource "aws_s3_bucket" "b" {
  bucket = "changemajor-${var.deploy_stage}"
  acl    = "public-read"


  tags = var.app_tags

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }

}



resource "aws_s3_bucket_policy" "b" {
  bucket = "changemajor-${var.deploy_stage}"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Id": "changemajor-bucket-policy",
  "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "${aws_s3_bucket.b.arn}/*"
        }
    ]
}
POLICY
}

locals {
  s3_origin_id = "changemajor-origin"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.b.bucket_regional_domain_name
    origin_id   = local.s3_origin_id
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "allow-all"
    min_ttl                = 0
    default_ttl            = 60
    max_ttl                = 60
  }

  tags = var.app_tags

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

output "cloudfront-domain-name" {
  value       = aws_cloudfront_distribution.s3_distribution.domain_name
  description = "Domain name corresponding to the distribution"
}






# API Gateway
resource "aws_api_gateway_rest_api" "test" {
  name = "changemajor-service-api-${var.deploy_stage}"
}

resource "aws_api_gateway_stage" "test" {
  stage_name    = "prod"
  rest_api_id   = aws_api_gateway_rest_api.test.id
  deployment_id = aws_api_gateway_deployment.test.id
}

resource "aws_api_gateway_deployment" "test" {
  depends_on  = [aws_api_gateway_integration.test]
  rest_api_id = aws_api_gateway_rest_api.test.id
  stage_name  = var.deploy_stage
}

resource "aws_api_gateway_resource" "test" {
  path_part   = "resource"
  parent_id   = aws_api_gateway_rest_api.test.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.test.id
}

resource "aws_api_gateway_method" "test" {
  rest_api_id   = aws_api_gateway_rest_api.test.id
  resource_id   = aws_api_gateway_resource.test.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method_settings" "s" {
  rest_api_id = aws_api_gateway_rest_api.test.id
  stage_name  = aws_api_gateway_stage.test.stage_name
  method_path = "${aws_api_gateway_resource.test.path_part}/${aws_api_gateway_method.test.http_method}"

  settings {
    metrics_enabled = true
    logging_level   = "INFO"
  }
}

resource "aws_api_gateway_integration" "test" {
  rest_api_id             = aws_api_gateway_rest_api.test.id
  resource_id             = aws_api_gateway_resource.test.id
  http_method             = "${aws_api_gateway_method.test.http_method}"
  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.test.invoke_arn
}

resource "aws_api_gateway_method_response" "test" {
  rest_api_id = aws_api_gateway_rest_api.test.id
  resource_id = aws_api_gateway_resource.test.id
  http_method = "${aws_api_gateway_method.test.http_method}"
  status_code = "200"
  response_models = {
    "application/json" = "Empty"
  }
}


resource "aws_api_gateway_integration_response" "test" {
  rest_api_id = "${aws_api_gateway_rest_api.test.id}"
  resource_id = "${aws_api_gateway_resource.test.id}"
  http_method = "${aws_api_gateway_method.test.http_method}"
  status_code = "${aws_api_gateway_method_response.test.status_code}"

}


#options

resource "aws_api_gateway_method" "options_method" {
  rest_api_id   = aws_api_gateway_rest_api.test.id
  resource_id   = aws_api_gateway_resource.test.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}
resource "aws_api_gateway_method_response" "options_200" {
  rest_api_id = aws_api_gateway_rest_api.test.id
  resource_id = aws_api_gateway_resource.test.id
  http_method = "${aws_api_gateway_method.options_method.http_method}"
  status_code = "200"
  response_models = {
    "application/json" = "Empty"
  }

}
resource "aws_api_gateway_integration" "options_integration" {
  rest_api_id = "${aws_api_gateway_rest_api.test.id}"
  resource_id = "${aws_api_gateway_resource.test.id}"
  http_method = "${aws_api_gateway_method.options_method.http_method}"
  type        = "MOCK"
  depends_on  = ["aws_api_gateway_method.options_method"]
}
resource "aws_api_gateway_integration_response" "options_integration_response" {
  rest_api_id = "${aws_api_gateway_rest_api.test.id}"
  resource_id = "${aws_api_gateway_resource.test.id}"
  http_method = "${aws_api_gateway_method.options_method.http_method}"
  status_code = "${aws_api_gateway_method_response.options_200.status_code}"

}



data "aws_caller_identity" "current" {}

# Lambda
resource "aws_lambda_permission" "test" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.test.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "arn:aws:execute-api:${var.aws_region}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.test.id}/*/${aws_api_gateway_method.test.http_method}${aws_api_gateway_resource.test.path}"


}

resource "aws_lambda_function" "test" {
  filename      = "changemajor_service_connector.zip"
  function_name = "changemajor_service_connector-${var.deploy_stage}"
  role          = aws_iam_role.role.arn
  handler       = "exports.handler"
  runtime       = "nodejs12.x"
  environment {
    variables = {
      CHANGEMAJOR_PARAMETER_PATH = "/changemajor/${var.deploy_stage}"
    }
  }
}







resource "aws_ssm_parameter" "mulesoft_url" {
  name  = "/changemajor/${var.deploy_stage}/mulesoft/url"
  type  = "String"
  value = "${var.mulesoft_url}"
}

resource "aws_ssm_parameter" "mulesoft_username" {
  name  = "/changemajor/${var.deploy_stage}/mulesoft/username"
  type  = "SecureString"
  value = "xxx"

}


resource "aws_ssm_parameter" "mulesoft_password" {
  name  = "/changemajor/${var.deploy_stage}/mulesoft/password"
  type  = "SecureString"
  value = "xxx"
}



resource "aws_ssm_parameter" "elasticsearch_url" {
  name  = "/changemajor/${var.deploy_stage}/elasticsearch/url"
  type  = "String"
  value = "${var.elasticsearch_url}"
}


resource "aws_ssm_parameter" "elasticsearch_username" {
  name  = "/changemajor/${var.deploy_stage}/elasticsearch/username"
  type  = "SecureString"
  value = "xxx"

}

resource "aws_ssm_parameter" "elasticsearch_password" {
  name  = "/changemajor/${var.deploy_stage}/elasticsearch/password"
  type  = "SecureString"
  value = "xxx"
}



resource "aws_ssm_parameter" "smtp_username" {
  name  = "/changemajor/${var.deploy_stage}/smtp/username"
  type  = "String"
  value = "xxx"
}

resource "aws_ssm_parameter" "smtp_password" {
  name  = "/changemajor/${var.deploy_stage}/smtp/password"
  type  = "SecureString"
  value = "xxx"
}



# IAM
resource "aws_iam_role" "role" {
  name = "changemajor_lambda_role"

  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
POLICY
}