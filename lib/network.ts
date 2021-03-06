import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { NetworkCidr } from "./config";
import {VpcProps} from "@aws-cdk/aws-ec2";

export class Network extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpcProps: VpcProps = {
      cidr: NetworkCidr,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE
        }
      ]
    }

    this.vpc = new ec2.Vpc(this, 'VPC', vpcProps);
  }
}
