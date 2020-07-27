#!groovy
def subdir = 'terraform/changemajor-terraform'
def terraforminitfile = 'sdc-backend.config'
def awsrole = 'arn:aws:iam::139714795802:role/Jenkins'
// def awsrole = 'arn:aws:iam::959127064244:role/Jenkins'
def slackChannel = '#prdfam-eadv-ci'
def statusCode

def VAULT_ADDR = 'https://ops-vault-prod.opsprod.asu.edu'

pipeline {
  //agent any
  agent {
    label 'ec2-docker'
  }
  options {
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }
  triggers {
    cron('H H * * *') //run once per day
  }
  stages {
    // stage('Terraform Init') {
    //   agent {
    //     docker {
    //       reuseNode true
    //       image 'bootswithdefer/terragrunt:0.12'
    //     }
    //   }
    //   steps {
    //     terraformInit(subdir, terraforminitfile)
    //   }
    // }
    // stage('Plan') {
    //   agent {
    //     docker {
    //       reuseNode true
    //       image 'bootswithdefer/terragrunt:0.12'
    //     }
    //   }
    //   steps {
    //       script {
    //         def vaultToken = vaultLogin(VAULT_ADDR, 'ops-vault-jenkins')
    //         statusCode = terraformPlan(subdir, env.env_name,"-var vault_addr=${VAULT_ADDR} -var vault_token=${vaultToken}")
    //       }
    //   }
    // }
    // stage('Apply') {
    //   when {
    //     beforeAgent true
    //     beforeInput true
    //     branch 'master'
    //     expression {
    //       statusCode == 2
    //     }
    //   }
    //   agent {
    //     docker {
    //       reuseNode true
    //       image 'bootswithdefer/terragrunt:0.12'
    //     }
    //   }
    //   options {
    //     timeout(time: 60, unit: 'MINUTES')
    //   }
    //   input {
    //     message "Should we continue?"
    //     ok "Yes, we should."
    //   }
    //   steps {
    //     script {
		// 			def vaultToken = vaultLogin(VAULT_ADDR, 'ops-vault-jenkins')
		// 			terraformApply(subdir, env.env_name, "-var vault_addr=${VAULT_ADDR} -var vault_token=${vaultToken}")
    //     }
    //   }
    // }
    stage('Build Code') {
      agent {
        docker {
          reuseNode true
          image 'node:12.18.0-alpine'
        }
      }
      steps {
        dir(path: 'changemajor/src') {
          sh 'yes | cp -rf properties.js.$properties_env properties.js'
        }
        
        dir(path: 'changemajor') {
          sh 'npm install && npm run build'
          stash includes: 'build/', name: 'build'
        } 
      }
    }
    // stage('Copy to s3') {
    //   agent any
      
    //   steps {
    //     dir(path: 'changemajor') {
    //       unstash name: 'build'
    //       withAWS(role:awsrole){
    //         sh 'aws s3 cp build/ s3://changemajor-$env_name --recursive'
    //       }
    //     } 
    //   }
    // }

// stage('Init Lambda-layer') {
//             agent {
//                 docker {
//                     reuseNode true
//                     image 'node:12.14.1-alpine'
//                     args '-u root:root'
//                 }
//             }
//             steps {
//                 dir(path: 'changemajor-lambda') {
//                     sh """
//                     mkdir nodejs
//                     cd nodejs && npm install elasticsearch http-aws-es fs jsonwebtoken davexmlrpc && wget https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem
//                     cd ..
//                     find -print -exec touch -t 202001010000 '{}' \\;
//                     apk update && apk add zip && zip -X -r changemajor_service_connector.zip nodejs/ && apk del zip
//                     rm -rf nodejs/
//                     chown node:node changemajor_service_connector.zip
//                     """
//                     stash includes: 'changemajor_service_connector.zip', name: 'changemajor_service_connector'
//                 }
//             }
//         }

        // stage('Copy Lambda-layer to S3 uat') {
        //     agent {
        //         docker {
        //             reuseNode true
        //             image 'bootswithdefer/packer-ansible'
        //         }
        //     }
        //     steps {
        //         dir(path: 'changemajor-lambda') {
        //             unstash name: 'changemajor_service_connector'
        //             withAWS(role:awsrole){
        //                 sh 'openssl dgst -sha256 -binary changemajor_service_connector.zip | openssl enc -base64 | xargs echo -n > changemajor_service_connector.zip.base64sha256'
        //                 sh 'aws s3 cp changemajor_service_connector.zip.base64sha256 s3://uto-lambda-uat/layers/ --content-type text/plain'
        //                 sh 'aws s3 cp changemajor_service_connector.zip s3://uto-lambda-uat/layers/'
        //             }
        //         }
        //     }
        // }
    
    
  }
  post { 
    // always {
    //   slackNotification("${slackChannel}")
    //  clean()
    // }
  }

  environment {
    HOME = '.'
    env_name = 'prod'
    properties_env = 'prod'
  }
}
