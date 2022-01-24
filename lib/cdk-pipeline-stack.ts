import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { CdkPipelineStage } from './cdk-pipeline-stage';
import * as ssm from 'aws-cdk-lib/aws-ssm';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cypressUsername = ssm.StringParameter.valueForStringParameter(
      this, 'cypressUsername');

    const cypressUserPassword = ssm.StringParameter.valueForStringParameter(
      this, 'cypressUserPassword');


    const repo = 'PedroJPerez/cdk-pipeline';
    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'MyPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(repo, 'master'),
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
        env: {
          "CYPRESS_USERNAME": cypressUsername,
          "CYPRESS_USER_PASSWORD": cypressUserPassword
        }
      })
    });

    const deploy = new CdkPipelineStage(this, 'Deploy');
    const stage = pipeline.addStage(deploy);

    stage.addPost(new CodeBuildStep('Test', {
      input: CodePipelineSource.gitHub(repo, 'master'),
      env: {
        "CYPRESS_USERNAME": cypressUsername,
        "CYPRESS_USER_PASSWORD": cypressUserPassword
      },
      commands: ['npm ci', 'npm run build', 'npm run cy-test']
    }
    ));

    /*
    deployStage.addPost(
      new CodeBuildStep('Post-Deployment-Validation', {
        input: CodePipelineSource.gitHub(repo, 'master'),
        env: {
          "CYPRESS_USERNAME": cypressUsername,
          "CYPRESS_USER_PASSWORD": cypressUserPassword
        },
        commands: ['npm ci', 'npm run build', 'npm run cy-test']
      }) 
    ); */
  }
}
