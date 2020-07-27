aws_region        = "us-west-2"
admin_role_arn    = "arn:aws:iam::139714795802:role/Jenkins"
deploy_stage      = "prod"
elasticsearch_url = "https://search-programs-elasticsearch-dev-mf5qi7rm5hgr64d2hj6buahlzq.us-west-2.es.amazonaws.com"
mulesoft_url      = "https://esb-qa.asu.edu/api/v1/change-major/"


app_tags = {
  AppContext        = "changmajor"
  AppName           = "changemajor"
  AppAdminContact   = "guirongg"
  Name              = "Change Major app"
  Product           = "Changemajor"
  ProductFamily     = "eAdvisor"
  ProductCategory   = "Customer Applications"
  BillingCostCenter = "CC0713"
  BillingProgram    = "PG06102"
  Lifecycle         = "prod"
  TechContact       = "guirongg"
  AdminContact      = "lcabre"
}