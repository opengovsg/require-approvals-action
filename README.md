# Require PR Approvals Action

Requires at least 1 valid approval on a pull request.

## Example usage

```yaml
on: pull_request
name: Example Job
jobs:
  example-job:
    runs-on: ubuntu-latest
    steps:
    - uses: opengovsg/require-pr-approvals-action@v1.0.0
      id: require-pr-approvals
    - if: steps.require-pr-approvals.outputs.status == 'success'
      run: echo "PR is already approved!"
    - if: steps.require-pr-approvals.outputs.status == 'failure'
      run: |
        echo "PR is not approved!"
        exit 1
```
