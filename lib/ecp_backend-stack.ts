import * as cdk from "aws-cdk-lib";
import { Construct } from 'constructs';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2"
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";

export class EcpBackendStack extends cdk.Stack {

    private vpc: ec2.Vpc;
    private apiGateway: LambdaRestApi;
    private bucket: s3.Bucket;
    // private rds_ha: rds.DatabaseCluster; // High availability
    private rds_la: rds.DatabaseInstance; // Low availability

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here

        this.vpc = new ec2.Vpc(this, "Backend VPC", {
            subnetConfiguration: [
                {
                    name: "Public Subnet",
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    name: "Private Subnet",
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                },
            ],
        })

        this.bucket = new s3.Bucket(this, "jobeasy-uploads", {
            accessControl: s3.BucketAccessControl.PUBLIC_READ,
            enforceSSL: true,
            versioned: false,
            lifecycleRules: [
                {
                    transitions: [
                        {
                            storageClass: s3.StorageClass.INTELLIGENT_TIERING,
                        }
                    ]
                }
            ]
        })
    }
}
