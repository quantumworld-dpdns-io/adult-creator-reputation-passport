package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/ec2"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/eks"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/iam"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/rds"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/ecr"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/elasticache"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		cfg := config.New(ctx, "")
		env := cfg.Require("environment")

		// VPC
		vpc, err := ec2.NewVpc(ctx, "main", &ec2.VpcArgs{
			CidrBlock:          pulumi.String("10.0.0.0/16"),
			EnableDnsHostnames: pulumi.Bool(true),
			EnableDnsSupport:   pulumi.Bool(true),
			Tags: pulumi.StringMap{
				"Name":        pulumi.Sprintf("reputation-passport-%s", env),
				"Environment": pulumi.String(env),
			},
		})
		if err != nil {
			return err
		}

		// EKS Cluster
		eksRole, err := iam.NewRole(ctx, "eks-cluster-role", &iam.RoleArgs{
			AssumeRolePolicy: pulumi.String(`{
				"Version": "2012-10-17",
				"Statement": [{
					"Effect": "Allow",
					"Principal": {"Service": "eks.amazonaws.com"},
					"Action": "sts:AssumeRole"
				}]
			}`),
		})
		if err != nil {
			return err
		}

		cluster, err := eks.NewCluster(ctx, "main", &eks.ClusterArgs{
			Name:     pulumi.Sprintf("reputation-passport-%s", env),
			RoleArn:  eksRole.Arn,
			Version:  pulumi.String("1.31"),
			VpcConfig: &eks.ClusterVpcConfigArgs{
				EndpointPrivateAccess: pulumi.Bool(true),
				EndpointPublicAccess:  pulumi.Bool(true),
			},
		})
		if err != nil {
			return err
		}

		// RDS Postgres
		_, err = rds.NewInstance(ctx, "main", &rds.InstanceArgs{
			Engine:         pulumi.String("postgres"),
			EngineVersion:  pulumi.String("16.3"),
			InstanceClass:  pulumi.String("db.t3.medium"),
			AllocatedStorage: pulumi.Int(100),
			DbName:         pulumi.String("reputation_passport"),
			Username:       pulumi.String("reputation_admin"),
			Password:       pulumi.String(cfg.RequireSecret("dbPassword")),
			StorageEncrypted: pulumi.Bool(true),
			DeletionProtection: pulumi.Bool(true),
		})
		if err != nil {
			return err
		}

		// ECR Repositories
		repos := []string{"go-api", "rust-data", "python-ai", "nginx-pqc", "quantum"}
		for _, repo := range repos {
			_, err := ecr.NewRepository(ctx, repo, &ecr.RepositoryArgs{
				Name: pulumi.Sprintf("reputation-passport/%s", repo),
				ImageScanningConfiguration: &ecr.RepositoryImageScanningConfigurationArgs{
					ScanOnPush: pulumi.Bool(true),
				},
			})
			if err != nil {
				return err
			}
		}

		// S3 Buckets
		_, err = s3.NewBucket(ctx, "data-lake", &s3.BucketArgs{
			Bucket: pulumi.Sprintf("reputation-passport-%s-data-lake", env),
		})
		if err != nil {
			return err
		}

		// ElastiCache Redis
		_, err = elasticache.NewCluster(ctx, "redis", &elasticache.ClusterArgs{
			ClusterId:      pulumi.Sprintf("reputation-passport-%s", env),
			Engine:         pulumi.String("redis"),
			NodeType:       pulumi.String("cache.t3.micro"),
			NumCacheNodes:  pulumi.Int(1),
		})
		if err != nil {
			return err
		}

		ctx.Export("clusterEndpoint", cluster.Endpoint)
		return nil
	})
}
