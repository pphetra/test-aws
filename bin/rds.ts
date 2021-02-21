#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {NetworkStackName, DatabaseStackName, BastionStackName} from '../lib/config';

import { Network } from '../lib/network';
import {Database} from "../lib/database";
import { Bastion } from '../lib/bastion';
import {Api} from "../lib/api";

const app = new cdk.App();
const network = new Network(app, NetworkStackName);
const database = new Database(app, DatabaseStackName, {
  vpc: network.vpc
})
const api = new Api(app, 'testRdsApi', {
  vpc: network.vpc,
  db: database.db
})
const bastion = new Bastion(app, BastionStackName, {
  vpc: network.vpc
})
